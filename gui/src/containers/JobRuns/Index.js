import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import TablePagination from '@material-ui/core/TablePagination'
import matchRouteAndMapDispatchToProps from 'utils/matchRouteAndMapDispatchToProps'
import { fetchJobSpecRuns } from 'actions'
import jobRunsSelector from 'selectors/jobRuns'
import jobRunsCountSelector from 'selectors/jobRunsCount'
import Breadcrumb from 'components/Breadcrumb'
import BreadcrumbItem from 'components/BreadcrumbItem'
import JobRunsList from 'components/JobRunsList'
import TableButtons, { FIRST_PAGE } from 'components/TableButtons'
import Title from 'components/Title'

const styles = theme => ({
  breadcrumb: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  }
})

export class Index extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0
    }
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  componentDidMount () {
    const { jobSpecId, pageSize, fetchJobSpecRuns } = this.props
    const queryPage = this.props.match ? parseInt(this.props.match.params.jobRunsPage, 10) || FIRST_PAGE : FIRST_PAGE
    this.setState({ page: queryPage })
    fetchJobSpecRuns(jobSpecId, queryPage, pageSize)
  }

  componentDidUpdate (prevProps) {
    const prevJobRunsPage = prevProps.match.params.jobRunsPage
    const currentJobRunsPage = this.props.match.params.jobRunsPage

    if (prevJobRunsPage !== currentJobRunsPage) {
      const { pageSize, fetchJobSpecRuns, jobSpecId } = this.props
      this.setState({ page: parseInt(currentJobRunsPage, 10) || FIRST_PAGE })
      fetchJobSpecRuns(jobSpecId, parseInt(currentJobRunsPage, 10) || FIRST_PAGE, pageSize)
    }
  }

  handleChangePage (e, page) {
    const { fetchJobSpecRuns, jobSpecId, pageSize } = this.props
    fetchJobSpecRuns(jobSpecId, page, pageSize)
    this.setState({ page })
  }
  render () {
    const { classes, jobSpecId } = this.props

    return (
      <div>
        <Breadcrumb className={classes.breadcrumb}>
          <BreadcrumbItem href='/'>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>></BreadcrumbItem>
          <BreadcrumbItem href={`/jobs/${jobSpecId}`}>Job ID: {jobSpecId}</BreadcrumbItem>
          <BreadcrumbItem>></BreadcrumbItem>
          <BreadcrumbItem>Runs</BreadcrumbItem>
        </Breadcrumb>
        <Title>Runs</Title>

        {renderDetails(this.props, this.state, this.handleChangePage)}
      </div>
    )
  }
}

const renderLatestRuns = (props, state, handleChangePage) => {
  const { jobSpecId, latestJobRuns, jobRunsCount, pageSize } = props
  const TableButtonsWithProps = () => (
    <TableButtons
      {...props}
      count={jobRunsCount}
      onChangePage={handleChangePage}
      page={state.page}
      specID={jobSpecId}
      rowsPerPage={pageSize}
      replaceWith={`/jobs/${jobSpecId}/runs/page`}
    />
  )
  return (
    <Card>
      <JobRunsList jobSpecId={jobSpecId} runs={latestJobRuns} />
      <TablePagination
        component='div'
        count={jobRunsCount}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        page={state.page - 1}
        onChangePage={() => { } /* handler required by component, so make it a no-op */}
        onChangeRowsPerPage={() => { } /* handler required by component, so make it a no-op */}
        ActionsComponent={TableButtonsWithProps}
      />
    </Card>
  )
}

const renderFetching = () => <div>Fetching...</div>

const renderDetails = (props, state, handleChangePage) => {
  if (props.latestJobRuns && props.latestJobRuns.length > 0) {
    return renderLatestRuns(props, state, handleChangePage)
  } else {
    return renderFetching()
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  latestJobRuns: PropTypes.array,
  jobRunsCount: PropTypes.number,
  pageSize: PropTypes.number.isRequired
}

Index.defaultProps = {
  latestJobRuns: [],
  pageSize: 10
}

const mapStateToProps = (state, ownProps) => {
  const jobSpecId = ownProps.match.params.jobSpecId
  const jobRunsCount = jobRunsCountSelector(state)
  const latestJobRuns = jobRunsSelector(state, jobSpecId)

  return {
    jobSpecId,
    latestJobRuns,
    jobRunsCount
  }
}

export const ConnectedIndex = connect(
  mapStateToProps,
  matchRouteAndMapDispatchToProps({ fetchJobSpecRuns })
)(Index)

export default withStyles(styles)(ConnectedIndex)
