import PropTypes from 'prop-types'
import React from 'react'
import Page, {mapDispatchToProps, propTypes as pagePropTypes} from 'components/Page'

import { Formik, Form, Field } from 'formik'
import * as FieldHelper from 'components/FieldHelper'

import {ListGroup, ListGroupItem, Nav, NavItem} from 'react-bootstrap'
import pluralize from 'pluralize'

import Breadcrumbs from 'components/Breadcrumbs'
import Fieldset from 'components/Fieldset'
import LinkTo from 'components/LinkTo'
import Messages, {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'
import RelatedObjectNotes, {GRAPHQL_NOTES_FIELDS} from 'components/RelatedObjectNotes'
import DictionaryField from '../../HOC/DictionaryField'
import SubNav from 'components/SubNav'

import GuidedTour from 'components/GuidedTour'
import {orgTour} from 'pages/HopscotchTour'

import OrganizationTasks from './OrganizationTasks'
import OrganizationLaydown from './Laydown'
import OrganizationApprovals from './Approvals'

import GQL from 'graphqlapi'
import {Organization, Person, Position, Report, Task} from 'models'
import Settings from 'Settings'

import AppContext from 'components/AppContext'
import { connect } from 'react-redux'
import Scrollspy from 'react-scrollspy'

const NO_REPORT_FILTER = 'NO_FILTER'

class BaseOrganizationShow extends Page {

	static propTypes = {
		...pagePropTypes,
		currentUser: PropTypes.instanceOf(Person),
		scrollspyOffset: PropTypes.number,
	}

	static modelName = 'Organization'

	IdentificationCodeFieldWithLabel = DictionaryField(Field)
	LongNameWithLabel = DictionaryField(Field)
	state = {
		organization: new Organization(),
		reportsFilter: NO_REPORT_FILTER,
		reports: null,
		tasks: null,
		reportsPageNum: 0,
		tasksPageNum: 0,
		success: null,
		error: null,
	}

	constructor(props) {
		super(props)
		setMessages(props,this.state)
	}

	componentDidUpdate(prevProps, prevState) {
		// Re-load data if uuid has changed
		if (this.props.match.params.uuid !== prevProps.match.params.uuid) {
			this.loadData()
		}
		else if (prevState.reportsFilter !== this.state.reportsFilter) {
			let reports = this.getReportQueryPart(this.props.match.params.uuid)
			this.runGQLReports([reports])
		}
	}

	getReportQueryPart = (orgUuid) => {
		let reportQuery = {
			pageNum: this.state.reportsPageNum,
			pageSize: 10,
			orgUuid: orgUuid,
			state: (this.reportsFilterIsSet()) ? this.state.reportsFilter : null
		}
		let reportsPart = new GQL.Part(/* GraphQL */`
			reports: reportList(query:$reportQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`)
			.addVariable("reportQuery", "ReportSearchQueryInput", reportQuery)
		return reportsPart
	}

	getTaskQueryPart = (orgUuid) => {
		let taskQuery = {
			pageNum: this.state.tasksPageNum,
			status: Task.STATUS.ACTIVE,
			pageSize: 10,
			responsibleOrgUuid: orgUuid
		}
		let taskPart = new GQL.Part(/* GraphQL */`
			tasks: taskList(query:$taskQuery) {
				pageNum, pageSize, totalCount, list {
					uuid, shortName, longName
				}
			}`)
			.addVariable("taskQuery", "TaskSearchQueryInput", taskQuery)
		return taskPart
	}

	fetchData(props) {
		let orgPart = new GQL.Part(/* GraphQL */`
			organization(uuid:"${props.match.params.uuid}") {
				uuid, shortName, longName, status, identificationCode, type
				parentOrg { uuid, shortName, longName, identificationCode }
				childrenOrgs { uuid, shortName, longName, identificationCode },
				positions {
					uuid, name, code, status, type,
					person { uuid, name, status, rank }
					associatedPositions {
						uuid, name, code, status
						person { uuid, name, status, rank}
					}
				},
				approvalSteps {
					uuid, name, approvers { uuid, name, person { uuid, name, rank}}
				}
				${GRAPHQL_NOTES_FIELDS}
			}`)
		let reportsPart = this.getReportQueryPart(props.match.params.uuid)
		let tasksPart = this.getTaskQueryPart(props.match.params.uuid)

		return this.runGQL([orgPart, reportsPart, tasksPart])
	}

	runGQL = (queries) => {
		return GQL.run(queries).then(data =>
			this.setState({
				organization: new Organization(data.organization),
				reports: data.reports,
				tasks: data.tasks
			})
		)
	}

	runGQLReports = (reports) => {
		GQL.run(reports).then( data => this.setState({ reports: data.reports }) )
	}

	reportsFilterIsSet = () => {
		return (this.state.reportsFilter !== NO_REPORT_FILTER)
	}

	togglePendingApprovalFilter = () => {
		let toggleToFilter = this.state.reportsFilter
		if(toggleToFilter === Report.STATE.PENDING_APPROVAL){
			toggleToFilter = NO_REPORT_FILTER
		}else{
			toggleToFilter = Report.STATE.PENDING_APPROVAL
		}
		this.setState({ reportsFilter: toggleToFilter })
	}

	render() {
		const { organization, reports, tasks } = this.state
		const { currentUser, ...myFormProps } = this.props

		const isSuperUser = currentUser && currentUser.isSuperUserForOrg(organization)
		const isAdmin = currentUser && currentUser.isAdmin()
		const isAdvisorOrg = (organization.type === Organization.TYPE.ADVISOR_ORG)
		const isPrincipalOrg = (organization.type === Organization.TYPE.PRINCIPAL_ORG)
		const orgSettings = isPrincipalOrg ? Settings.fields.principal.org : Settings.fields.advisor.org

		const superUsers = organization.positions.filter(pos => pos.status !== Position.STATUS.INACTIVE && (!pos.person || pos.person.status !== Position.STATUS.INACTIVE) && (pos.type === Position.TYPE.SUPER_USER || pos.type === Position.TYPE.ADMINISTRATOR))
		const myOrg = currentUser && currentUser.position ? currentUser.position.organization : null
		const isMyOrg = myOrg && (organization.uuid === myOrg.uuid)
		const orgSubNav = (
			<Nav>
				<Scrollspy className="nav" currentClassName="active" offset={this.props.scrollspyOffset}
				items={ ['info', 'supportedPositions', 'vacantPositions', 'approvals', 'tasks', 'reports'] }>
					<NavItem href="#info">Info</NavItem>
					<NavItem href="#supportedPositions">Supported positions</NavItem>
					<NavItem href="#vacantPositions">Vacant positions</NavItem>
					{!isPrincipalOrg && <NavItem href="#approvals">Approvals</NavItem>}
					{organization.isTaskEnabled() && <NavItem href="#tasks">{pluralize(Settings.fields.task.shortLabel)}</NavItem> }
					<NavItem href="#reports">Reports</NavItem>
				</Scrollspy>
			</Nav>
		)
		if (currentUser._loaded !== true) {
			return <div className='loader'></div>
		}
		return (
			<Formik
				enableReinitialize={true}
				initialValues={organization}
				{...myFormProps}
			>
			{({
				values,
			}) => {
				const action = <div>
					{isAdmin && <LinkTo organization={Organization.pathForNew({parentOrgUuid: organization.uuid})} button>
						Create sub-organization
					</LinkTo>}

					{isSuperUser && <LinkTo organization={organization} edit button="primary" id="editButton">
						Edit
					</LinkTo>}
				</div>
				return <div>
					<SubNav subnavElemId="myorg-nav">
						{isMyOrg && orgSubNav}
					</SubNav>

					<SubNav subnavElemId="org-nav">
						{!isMyOrg && orgSubNav}
					</SubNav>

					{currentUser.isSuperUser() && <div className="pull-right">
						<GuidedTour
							title="Take a guided tour of this organization's page."
							tour={orgTour}
							autostart={localStorage.newUser === 'true' && localStorage.hasSeenOrgTour !== 'true'}
							onEnd={() => localStorage.hasSeenOrgTour = 'true'}
						/>
					</div>}

					<RelatedObjectNotes notes={organization.notes} relatedObject={organization.uuid && {relatedObjectType: 'organizations', relatedObjectUuid: organization.uuid}} />
					<Breadcrumbs items={[[`Organization ${organization.shortName}`, Organization.pathFor(organization)]]} />
					<Messages success={this.state.success} error={this.state.error} />
					<Form className="form-horizontal" method="post">
						<Fieldset title={`Organization ${organization.shortName}`} action={action} />
						<Fieldset>
							<Field
								name="status"
								component={FieldHelper.renderReadonlyField}
								humanValue={Organization.humanNameOfStatus}
							/>

							<Field
								name="type"
								component={FieldHelper.renderReadonlyField}
								humanValue={Organization.humanNameOfType}
							/>

							<this.LongNameWithLabel
								dictProps={orgSettings.longName}
								name="longName"
								component={FieldHelper.renderReadonlyField}
							/>

							<this.IdentificationCodeFieldWithLabel
								dictProps={orgSettings.identificationCode}
								name="identificationCode"
								component={FieldHelper.renderReadonlyField}
							/>

							{organization.parentOrg && organization.parentOrg.uuid &&
								<Field
									name="parentOrg"
									component={FieldHelper.renderReadonlyField}
									label={Settings.fields.organization.parentOrg}
									humanValue={organization.parentOrg &&
										<LinkTo organization={organization.parentOrg}>
											{organization.parentOrg.shortName} {organization.parentOrg.longName} {organization.parentOrg.identificationCode}
										</LinkTo>
									}
								/>
							}

							{organization.isAdvisorOrg() &&
								<Field
									name="superUsers"
									component={FieldHelper.renderReadonlyField}
									label="Super users"
									humanValue={
										<React.Fragment>
											{superUsers.map(position =>
												<p key={position.uuid}>
													{position.person
														? <LinkTo person={position.person} />
														: <i><LinkTo position={position} />- (Unfilled)</i>
													}
												</p>
											)}
											{superUsers.length === 0 && <p><i>No super users</i></p>}
										</React.Fragment>
									}
								/>
							}

							{organization.childrenOrgs && organization.childrenOrgs.length > 0 &&
								<Field
									name="childrenOrgs"
									component={FieldHelper.renderReadonlyField}
									label="Sub organizations"
									humanValue={
										<ListGroup>
											{organization.childrenOrgs.map(organization =>
												<ListGroupItem key={organization.uuid} >
													<LinkTo organization={organization} >{organization.shortName} {organization.longName} {organization.identificationCode}</LinkTo>
												</ListGroupItem>
											)}
										</ListGroup>
									}
								/>
							}
						</Fieldset>

						<OrganizationLaydown organization={organization} />
						{!isPrincipalOrg && <OrganizationApprovals organization={organization} />}
						{ organization.isTaskEnabled() &&
							<OrganizationTasks organization={organization} tasks={tasks} goToPage={this.goToTasksPage}/>
						}

						<Fieldset id="reports" title={`Reports from ${organization.shortName}`}>
							<ReportCollection
								paginatedReports={reports}
								goToPage={this.goToReportsPage}
								setReportsFilter={this.togglePendingApprovalFilter}
								filterIsSet={this.reportsFilterIsSet()}
								isSuperUser={isSuperUser}
							/>
						</Fieldset>
					</Form>
				</div>
			}}
			</Formik>
		)
	}

	goToReportsPage = (pageNum) => {
		this.setState({reportsPageNum: pageNum}, () => {
			const reportQueryPart = this.getReportQueryPart(this.state.organization.uuid)
			GQL.run([reportQueryPart]).then(data =>
				this.setState({reports: data.reports})
			)
		})
	}

	goToTasksPage = (pageNum) => {
		this.setState({tasksPageNum: pageNum}, () => {
			const taskQueryPart = this.getTaskQueryPart(this.state.organization.uuid)
			GQL.run([taskQueryPart]).then(data =>
				this.setState({tasks: data.tasks})
			)
		})
	}
}



const OrganizationShow = (props) => (
	<AppContext.Consumer>
		{context =>
			<BaseOrganizationShow currentUser={context.currentUser} scrollspyOffset={context.scrollspyOffset} {...props} />
		}
	</AppContext.Consumer>
)

export default connect(null, mapDispatchToProps)(OrganizationShow)
