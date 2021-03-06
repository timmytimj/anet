import {
  CustomFieldsContainer,
  ReadonlyCustomFields
} from "components/CustomFields"
import LinkTo from "components/LinkTo"
import Model from "components/Model"
import _isEmpty from "lodash/isEmpty"
import PropTypes from "prop-types"
import React from "react"
import { Table } from "react-bootstrap"

const InstantAssessmentsContainerField = ({
  entityType,
  entities,
  entitiesInstantAssessmentsConfig,
  parentFieldName,
  formikProps,
  readonly
}) => {
  const { values } = formikProps
  return (
    <Table condensed responsive>
      <tbody>
        {entities.map(entity => {
          const entityInstantAssessmentConfig = !_isEmpty(
            entitiesInstantAssessmentsConfig
          )
            ? entitiesInstantAssessmentsConfig[entity.uuid]
            : entity.getInstantAssessmentConfig()
          if (!entityInstantAssessmentConfig) {
            return null
          }
          return (
            <React.Fragment key={`assessment-${values.uuid}-${entity.uuid}`}>
              <tr>
                <td>
                  <LinkTo modelType={entityType.resourceName} model={entity} />
                </td>
              </tr>
              <tr>
                <td>
                  {readonly ? (
                    <ReadonlyCustomFields
                      parentFieldName={`${parentFieldName}.${entity.uuid}`}
                      fieldsConfig={entityInstantAssessmentConfig}
                      values={values}
                    />
                  ) : (
                    <CustomFieldsContainer
                      parentFieldName={`${parentFieldName}.${entity.uuid}`}
                      fieldsConfig={entityInstantAssessmentConfig}
                      formikProps={formikProps}
                    />
                  )}
                </td>
              </tr>
            </React.Fragment>
          )
        })}
      </tbody>
    </Table>
  )
}
InstantAssessmentsContainerField.propTypes = {
  entityType: PropTypes.func.isRequired,
  entities: PropTypes.arrayOf(PropTypes.instanceOf(Model)),
  entitiesInstantAssessmentsConfig: PropTypes.object,
  parentFieldName: PropTypes.string.isRequired,
  formikProps: PropTypes.shape({
    setFieldTouched: PropTypes.func,
    setFieldValue: PropTypes.func,
    values: PropTypes.object.isRequired,
    validateForm: PropTypes.func
  }),
  readonly: PropTypes.bool
}
InstantAssessmentsContainerField.defaultProps = {
  entities: [],
  readonly: false
}
export default InstantAssessmentsContainerField
