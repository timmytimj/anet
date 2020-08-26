import { DEFAULT_PAGE_PROPS } from "actions"
import AppContext from "components/AppContext"
import Fieldset from "components/Fieldset"
import {
  mapPageDispatchersToProps,
  PageDispatchersPropType,
  useBoilerplate
} from "components/Page"
import PositionTable from "components/PositionTable"
import React, { useContext } from "react"
import { connect } from "react-redux"

const MyCounterparts = ({ pageDispatchers }) => {
  // Make sure we have a navigation menu
  useBoilerplate({
    pageProps: DEFAULT_PAGE_PROPS,
    pageDispatchers
  })
  const { currentUser } = useContext(AppContext)
  return (
    <div>
      <Fieldset id="my-counterparts" title="My Counterparts">
        <PositionTable positions={currentUser.position.associatedPositions} />
      </Fieldset>
    </div>
  )
}

MyCounterparts.propTypes = {
  pageDispatchers: PageDispatchersPropType
}

export default connect(null, mapPageDispatchersToProps)(MyCounterparts)
