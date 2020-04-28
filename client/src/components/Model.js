import API from "api"
import { gql } from "apollo-boost"
import _forEach from "lodash/forEach"
import _isEmpty from "lodash/isEmpty"
import * as Models from "models"
import moment from "moment"
import PropTypes from "prop-types"
import encodeQuery from "querystring/encode"
import utils from "utils"
import * as yup from "yup"

export const GRAPHQL_NOTE_FIELDS = /* GraphQL */ `
  uuid
  createdAt
  updatedAt
  type
  text
  author {
    uuid
    name
    rank
    role
  }
  noteRelatedObjects {
    noteUuid
    relatedObjectType
    relatedObjectUuid
    relatedObject {
      ... on AuthorizationGroup {
        name
      }
      ... on Location {
        name
      }
      ... on Organization {
        shortName
      }
      ... on Person {
        role
        rank
        name
        avatar(size: 32)
      }
      ... on Position {
        type
        name
      }
      ... on Report {
        intent
      }
      ... on Task {
        shortName
        longName
      }
    }
  }
`
export const GRAPHQL_NOTES_FIELDS = /* GraphQL */ `
  notes {
    ${GRAPHQL_NOTE_FIELDS}
  }
`

export const GQL_CREATE_NOTE = gql`
  mutation($note: NoteInput!) {
    createNote(note: $note) {
      ${GRAPHQL_NOTE_FIELDS}
    }
  }
`
export const GQL_UPDATE_NOTE = gql`
  mutation($note: NoteInput!) {
    updateNote(note: $note) {
      ${GRAPHQL_NOTE_FIELDS}
    }
  }
`

export const MODEL_TO_OBJECT_TYPE = {
  AuthorizationGroup: "authorizationGroups",
  Location: "locations",
  Organization: "organizations",
  Person: "people",
  Position: "positions",
  Report: "reports",
  Task: "tasks"
}
export const OBJECT_TYPE_TO_MODEL = {}
Object.entries(MODEL_TO_OBJECT_TYPE).forEach(([k, v]) => {
  OBJECT_TYPE_TO_MODEL[v] = k
})

export const NOTE_TYPE = {
  FREE_TEXT: "FREE_TEXT",
  CHANGE_RECORD: "CHANGE_RECORD",
  PARTNER_ASSESSMENT: "PARTNER_ASSESSMENT",
  ASSESSMENT: "ASSESSMENT"
}
export const yupDate = yup.date().transform(function(value, originalValue) {
  if (this.isType(value)) {
    return value
  }
  const newValue = moment(originalValue)
  return newValue.isValid() ? newValue.toDate() : value
})

export const CUSTOM_FIELD_TYPE = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  DATETIME: "datetime",
  ENUM: "enum",
  ENUMSET: "enumset",
  ARRAY_OF_OBJECTS: "array_of_objects",
  SPECIAL_FIELD: "special_field"
}

const CUSTOM_FIELD_TYPE_SCHEMA = {
  [CUSTOM_FIELD_TYPE.TEXT]: yup.string().nullable().default(""),
  [CUSTOM_FIELD_TYPE.NUMBER]: yup.number().nullable().default(null),
  [CUSTOM_FIELD_TYPE.DATE]: yupDate.nullable().default(null),
  [CUSTOM_FIELD_TYPE.DATETIME]: yupDate.nullable().default(null),
  [CUSTOM_FIELD_TYPE.ENUM]: yup.string().nullable().default(""),
  [CUSTOM_FIELD_TYPE.ENUMSET]: yup.array().nullable().default([]),
  [CUSTOM_FIELD_TYPE.ARRAY_OF_OBJECTS]: yup.array().nullable().default([]),
  [CUSTOM_FIELD_TYPE.SPECIAL_FIELD]: yup.mixed().nullable().default(null)
}

const createFieldYupSchema = (fieldKey, fieldConfig, fieldPrefix) => {
  const { label, validations, objectFields, typeError } = fieldConfig
  let fieldTypeYupSchema = CUSTOM_FIELD_TYPE_SCHEMA[fieldConfig.type]
  if (typeError) {
    fieldTypeYupSchema = fieldTypeYupSchema.typeError(typeError)
  }
  if (!_isEmpty(objectFields)) {
    const objSchema = createYupObjectShape(objectFields, fieldPrefix)
    fieldTypeYupSchema = fieldTypeYupSchema.of(objSchema)
  }
  if (!_isEmpty(validations)) {
    validations.forEach(validation => {
      const { params, type } = validation
      if (!fieldTypeYupSchema[type]) {
        return
      }
      fieldTypeYupSchema = !_isEmpty(params)
        ? fieldTypeYupSchema[type](...params)
        : fieldTypeYupSchema[type]()
    })
  }

  let fieldYupSchema = yup.mixed().nullable().default(null)
  if (!_isEmpty(label)) {
    fieldYupSchema = fieldYupSchema.label(label)
  }
  // Field type specific validation not needed when the field is invisible or
  // when invisibleCustomFields hasn't even been filled (like when the report
  // has been created via server side tests, or later maybe imported from an
  // external system (and never went through the edit/create form which normally
  // fills the invisibleCustomFields)
  fieldYupSchema = fieldYupSchema.when(
    "invisibleCustomFields",
    (invisibleCustomFields, schema) => {
      return invisibleCustomFields === null ||
        (invisibleCustomFields &&
          invisibleCustomFields.includes(`${fieldPrefix}.${fieldKey}`))
        ? schema
        : schema.concat(fieldTypeYupSchema)
    }
  )
  return fieldYupSchema
}

export const createYupObjectShape = (config, prefix = "formCustomFields") => {
  let objShape = {}
  if (config) {
    objShape = Object.fromEntries(
      Object.entries(config)
        .map(([k, v]) => [k, createFieldYupSchema(k, config[k], prefix)])
        .filter(([k, v]) => v !== null)
    )
    objShape.invisibleCustomFields = yup.mixed().nullable().default(null)
  }
  return yup.object().shape(objShape)
}

export default class Model {
  static schema = {
    notes: []
  }

  static yupSchema = yup.object().shape({
    notes: yup.array().nullable().default([])
  })

  static fillObject(props, yupSchema) {
    try {
      const obj = yupSchema.cast(props)
      _forEach(yupSchema.fields, (value, key) => {
        if (
          !Object.prototype.hasOwnProperty.call(obj, key) ||
          obj[key] === null ||
          obj[key] === undefined
        ) {
          obj[key] = value.default()
        }
      })
      return obj
    } catch (e) {
      console.log("Coercion exception:", e)
      throw e
    }
  }

  static relatedObjectPropType = PropTypes.shape({
    noteUuid: PropTypes.string,
    relatedObjectType: PropTypes.string.isRequired,
    relatedObjectUuid: PropTypes.string.isRequired,
    relatedObject: PropTypes.object
  })

  static noteRelatedObjectsPropType = PropTypes.arrayOf(
    Model.relatedObjectPropType
  )

  static notePropType = PropTypes.shape({
    uuid: PropTypes.string,
    createdAt: PropTypes.number,
    text: PropTypes.string,
    author: PropTypes.shape({
      uuid: PropTypes.string,
      name: PropTypes.string,
      rank: PropTypes.string,
      role: PropTypes.string
    }),
    noteRelatedObjects: Model.noteRelatedObjectsPropType
  })

  static resourceName = null
  static displayName(appSettings) {
    return null
  }

  static listName = null

  static fromArray(array) {
    if (!array) return []

    return array.map(object =>
      object instanceof this ? object : new this(object)
    )
  }

  static map(array, func) {
    if (!array) return []

    return array.map((object, idx) =>
      object instanceof this ? func(object, idx) : func(new this(object), idx)
    )
  }

  static pathFor(instance, query) {
    if (!instance) {
      return console.error(
        `You didn't pass anything to ${this.name}.pathFor. If you want a new route, you can pass null.`
      )
    }

    if (process.env.NODE_ENV !== "production") {
      if (!this.resourceName) {
        return console.error(
          `You must specify a resourceName on model ${this.name}.`
        )
      }
    }

    const resourceName = utils.resourceize(this.resourceName)
    const uuid = instance.uuid
    let url = ["", resourceName, uuid].join("/")

    if (query) {
      url += "?" + encodeQuery(query)
    }

    return url
  }

  static pathForNew(query) {
    const resourceName = utils.resourceize(this.resourceName)
    let url = ["", resourceName, "new"].join("/")

    if (query) {
      url += "?" + encodeQuery(query)
    }

    return url
  }

  static pathForEdit(instance, query) {
    let url = this.pathFor(instance) + "/edit"

    if (query) {
      url += "?" + encodeQuery(query)
    }

    return url
  }

  static isEqual(a, b) {
    return a && b && a.uuid === b.uuid
  }

  static fetchByUuid(uuid, ENTITY_GQL_FIELDS) {
    const fields = ENTITY_GQL_FIELDS[this.resourceName]
    if (!fields) {
      return null
    }

    return API.query(
      gql`
      query($uuid: String!) {
        ${this.getInstanceName}(uuid: $uuid) {
          ${fields}
        }
      }
    `,
      {
        uuid: uuid
      }
    ).then(data => new Models[this.resourceName](data[this.getInstanceName]))
  }

  constructor(props) {
    Object.forEach(this.constructor.schema, (key, value) => {
      if (Array.isArray(value) && value.length === 0) {
        this[key] = []
      } else if (
        value &&
        typeof value === "object" &&
        Object.keys(value).length === 0
      ) {
        this[key] = {}
      } else {
        this[key] = value
      }
    })

    if (props) {
      this.setState(props)
    }
  }

  setState(props) {
    Object.forEach(props, (key, value) => {
      this[key] = value
    })

    return this
  }

  iconUrl() {
    return ""
  }

  toPath(query) {
    return this.uuid
      ? this.constructor.pathFor(this, query)
      : this.constructor.pathForNew(query)
  }

  toString() {
    return this.name || this.uuid
  }
}
