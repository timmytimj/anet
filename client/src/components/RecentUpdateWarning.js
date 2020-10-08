import styled from "@emotion/styled"
import moment from "moment"
import PropTypes from "prop-types"
import React from "react"

const RecentUpdateWarning = ({
  updatedAt,
  recencyAmount,
  timeScale = "minutes"
}) => {
  const lastUpdate = updatedAt ? moment(updatedAt) : null

  const warning =
    lastUpdate && moment().diff(lastUpdate, timeScale) < recencyAmount
      ? "Recently Edited"
      : ""
  return warning ? <RecentUpdateWarnBox>{warning}</RecentUpdateWarnBox> : null
}
RecentUpdateWarning.propTypes = {
  updatedAt: PropTypes.object,
  recencyAmount: PropTypes.number, // minutes
  timeScale: PropTypes.string
}

const RecentUpdateWarnBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
  border-radius: 5px;
  background-color: red;
  padding: 3px;
`

export default RecentUpdateWarning
