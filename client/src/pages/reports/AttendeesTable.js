import LinkTo from "components/LinkTo"
import { Person, Report } from "models"
import PropTypes from "prop-types"
import React from "react"
import { Button, Label, Radio, Table } from "react-bootstrap"
import REMOVE_ICON from "resources/delete.png"
import "./AttendeesTable.css"
import {
  Popover,
  PopoverInteractionKind,
  Intent,
  Callout,
  Button as BpButton
} from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import moment from "moment"
import pluralize from "pluralize"
import { cloneDeep } from "lodash"

const RemoveIcon = () => (
  <img src={REMOVE_ICON} height={14} alt="Remove attendee" />
)

const RemoveButton = ({ title, handleOnClick }) => (
  <Button bsStyle="link" title={title} onClick={handleOnClick}>
    <RemoveIcon />
  </Button>
)
RemoveButton.propTypes = {
  title: PropTypes.string,
  handleOnClick: PropTypes.func
}

const AttendeeDividerRow = () => (
  <tr className="attendee-divider-row">
    <td colSpan={6}>
      <hr />
    </td>
  </tr>
)

const TableHeader = ({ showConflict, showDelete, hide }) => (
  <thead>
    <tr>
      <th className="col-xs-1" style={{ textAlign: "center" }}>
        {!hide && "Primary"}
      </th>
      <th className="col-xs-3">{!hide && "Name"}</th>
      <th className="col-xs-3">{!hide && "Position"}</th>
      <th className="col-xs-1">{!hide && "Location"}</th>
      <th className="col-xs-2">{!hide && "Organization"}</th>
      {showConflict && (
        <th className="col-xs-1" style={{ paddingLeft: "20px" }}>
          {!hide && "Conflicts"}
        </th>
      )}
      {showDelete && <th className="col-xs-1" />}
    </tr>
  </thead>
)
TableHeader.propTypes = {
  showConflict: PropTypes.bool,
  showDelete: PropTypes.bool,
  hide: PropTypes.bool
}

const TableBody = ({ attendees, handleAttendeeRow, role, enableDivider }) => (
  <tbody>
    {enableDivider && <AttendeeDividerRow />}
    {Person.map(
      attendees.filter(p => p.role === role),
      person => handleAttendeeRow(person)
    )}
  </tbody>
)
TableBody.propTypes = {
  attendees: PropTypes.array.isRequired,
  handleAttendeeRow: PropTypes.func,
  role: PropTypes.string,
  enableDivider: PropTypes.bool
}
TableBody.defaultProps = {
  attendees: []
}

const TableContainer = ({ className, children }) => (
  <Table striped condensed hover responsive className={className}>
    {children}
  </Table>
)
TableContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const RadioButton = ({ person, disabled, handleOnChange }) => (
  <Radio
    name={`primaryAttendee${person.role}`}
    className="primary"
    checked={person.primary}
    disabled={disabled}
    onChange={() => !disabled && handleOnChange(person)}
  >
    {person.primary && <Label bsStyle="primary">Primary</Label>}
  </Radio>
)
RadioButton.propTypes = {
  person: PropTypes.object,
  disabled: PropTypes.bool,
  handleOnChange: PropTypes.func
}

const PlannigConflict = ({ person }) => {
  if (!person.conflictedReports || !person?.conflictedReports?.length) {
    return ""
  }

  const reports = cloneDeep(person.conflictedReports).sort(
    (a, b) => a.engagementDate - b.engagementDate
  )

  return (
    <Popover
      content={
        <Callout
          title={
            person.toString() +
            " has " +
            reports.length +
            " conflicting " +
            pluralize("report", reports.length)
          }
          intent={Intent.WARNING}
        >
          {reports.map(report => (
            <LinkTo
              key={report.uuid}
              modelType="Report"
              model={report}
              style={{ display: "block" }}
            >
              {moment(report.engagementDate).format(
                Report.getEngagementDateFormat()
              )}
              {" >>> "}
              {report.duration > 0
                ? moment(report.engagementDate)
                  .add(report.duration, "minutes")
                  .format(Report.getEngagementDateFormat())
                : "..."}
            </LinkTo>
          ))}
        </Callout>
      }
      target={
        <BpButton icon={IconNames.WARNING_SIGN} intent={Intent.WARNING} minimal>
          {reports.length}&nbsp;{pluralize("conflict", reports.length)}
        </BpButton>
      }
      interactionKind={PopoverInteractionKind.CLICK}
    />
  )
}

PlannigConflict.propTypes = {
  person: PropTypes.object.isRequired
}

const AttendeesTable = ({
  attendees,
  disabled,
  onChange,
  showDelete,
  onDelete
}) => {
  return (
    <div id="attendeesContainer">
      <TableContainer className="advisorAttendeesTable">
        <TableHeader
          showDelete={showDelete}
          showConflict={Report.hasPlanningConflicts({ attendees })}
        />
        <TableBody
          attendees={attendees}
          role={Person.ROLE.ADVISOR}
          handleAttendeeRow={renderAttendeeRow}
        />
      </TableContainer>
      <TableContainer className="principalAttendeesTable">
        <TableHeader
          hide
          showDelete={showDelete}
          showConflict={Report.hasPlanningConflicts({ attendees })}
        />
        <TableBody
          attendees={attendees}
          role={Person.ROLE.PRINCIPAL}
          handleAttendeeRow={renderAttendeeRow}
          enableDivider
        />
      </TableContainer>
    </div>
  )

  function renderAttendeeRow(person) {
    return (
      <tr key={person.uuid}>
        <td className="primary-attendee">
          <RadioButton
            person={person}
            handleOnChange={setPrimaryAttendee}
            disabled={disabled}
          />
        </td>
        <td>
          <LinkTo modelType="Person" model={person} showIcon={false} />
        </td>
        <td>
          {person.position && person.position.uuid && (
            <LinkTo modelType="Position" model={person.position} />
          )}
          {person.position && person.position.code
            ? `, ${person.position.code}`
            : ""}
        </td>
        <td>
          <LinkTo
            modelType="Location"
            model={person.position && person.position.location}
            whenUnspecified=""
          />
        </td>
        <td>
          <LinkTo
            modelType="Organization"
            model={person.position && person.position.organization}
            whenUnspecified=""
          />
        </td>
        {Report.hasPlanningConflicts({ attendees }) && (
          <td>
            <PlannigConflict person={person} />
          </td>
        )}
        {showDelete && (
          <td>
            <RemoveButton
              title="Remove attendee"
              handleOnClick={() => onDelete(person)}
            />
          </td>
        )}
      </tr>
    )
  }

  function setPrimaryAttendee(person) {
    attendees.forEach(attendee => {
      if (Person.isEqual(attendee, person)) {
        attendee.primary = true
      } else if (attendee.role === person.role) {
        attendee.primary = false
      }
    })
    onChange(attendees)
  }
}

AttendeesTable.propTypes = {
  attendees: PropTypes.array,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  showDelete: PropTypes.bool,
  onDelete: PropTypes.func
}

export default AttendeesTable
