import { Icon, Intent, Tooltip } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import React from "react"
import PropTypes from "prop-types"

const ReportConflictIcon = ({ text, tooltip, large }) => (
  <span
    style={{
      verticalAlign: "middle",
      display: "inline-flex",
      alignItems: "center"
    }}
  >
    <Tooltip
      content={
        tooltip ||
        "This report has planning conflicts. Display report for further details."
      }
      intent={Intent.WARNING}
    >
      <Icon
        icon={IconNames.WARNING_SIGN}
        intent={Intent.WARNING}
        iconSize={large ? Icon.SIZE_LARGE : Icon.SIZE_STANDARD}
        style={{ margin: "0 5px" }}
      />
    </Tooltip>
    {text || ""}
  </span>
)

ReportConflictIcon.propTypes = {
  text: PropTypes.string,
  tooltip: PropTypes.string,
  large: PropTypes.bool
}

export default ReportConflictIcon
