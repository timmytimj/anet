import {
  Callout,
  Icon,
  Intent,
  Popover,
  PopoverInteractionKind,
  Tooltip
} from "@blueprintjs/core"
import pluralize from "pluralize"
import moment from "moment"
import { Button as BpButton } from "@blueprintjs/core/lib/esm/components/button/buttons"
import { IconNames } from "@blueprintjs/icons"
import PropTypes from "prop-types"
import React from "react"
import { gql } from "apollo-boost"
import { Person, Report } from "models"
import API from "api"
import LinkTo from "./LinkTo"

const GQL_GET_CONFLICTS = gql`
  query($uuid: String, $engagementDateStart: Instant, $duration: Int) {
    conflictedReportsOfPerson(
      uuid: $uuid
      engagementDateStart: $engagementDateStart
      duration: $duration
    ) {
      list {
        duration
        engagementDate
        uuid
      }
    }
  }
`

const ReportPlannigConflict = ({ person, report }) => {
  if (!report || !report.uuid || !report.engagementDate) return ""

  const { loading, error, data } = API.useApiQuery(GQL_GET_CONFLICTS, {
    uuid: person.uuid,
    engagementDateStart: moment(report.engagementDate).valueOf(),
    duration: report.duration || 0
  })

  if (loading) {
    return <div className="loader" />
  }

  if (error) {
    return (
      <Tooltip
        content="An error occured while checking planning conflicts!"
        intent={Intent.DANGER}
      >
        <Icon
          icon={IconNames.ERROR}
          intent={Intent.DANGER}
          iconSize={Icon.SIZE_STANDARD}
        />
      </Tooltip>
    )
  }
  //
  // const reports = (
  //   (data &&
  //     data.conflictedReportsOfPerson &&
  //     data.conflictedReportsOfPerson.list) ||
  //   []
  // )
  //   .filter(r => r.uuid !== report.uuid)
  //   .sort((a, b) => a.engagementDate - b.engagementDate)

  const reports = (Array.isArray(data?.conflictedReportsOfPerson?.list)
    ? data.conflictedReportsOfPerson.list
    : []
  )
    .filter(r => r.uuid !== report.uuid)
    .sort((a, b) => a.engagementDate - b.engagementDate)

  if (!reports.length) {
    return ""
  }

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

ReportPlannigConflict.propTypes = {
  person: PropTypes.instanceOf(Person).isRequired,
  report: PropTypes.instanceOf(Report).isRequired
}

export default ReportPlannigConflict
