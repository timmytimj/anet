/** @jsx jsx */
import { css, jsx } from "@emotion/core"

import PropTypes from "prop-types"
import styled from "@emotion/styled"

const Header = ({ title, prevAction, nextAction, todayAction, views }) => {
  const options = (
    <select name="views" id="viewsSelect">
      {views.map(view => (
        <option key={view} value={view}>
          {view}
        </option>
      ))}
      )
    </select>
  )

  return (
    <HeaderBox>
      <Buttons>
        <button onClick={prevAction}>Prev</button>
        <button onClick={todayAction}>Today</button>
        <button onClick={nextAction}>Next</button>
      </Buttons>
      <span>{title}</span>
      <ViewSelect>
        <label htmlFor="viewsSelect">View Options</label>
        {options}
      </ViewSelect>
    </HeaderBox>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  prevAction: PropTypes.func,
  nextAction: PropTypes.func,
  todayAction: PropTypes.func,
  views: PropTypes.arrayOf(PropTypes.string)
}

const HeaderBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px auto;
  margin: 5px auto;
`

const BUTTONS_STYLE = css`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  & > * {
    margin-left: 5px;
    margin-right: 5px;
  }
`
const Buttons = styled.div`
  ${BUTTONS_STYLE};
`

const ViewSelect = styled.div`
  ${BUTTONS_STYLE};
`

export default Header
