import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link as BaseLink } from 'react-static'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import { isWebInitiator, formatInitiators } from 'utils/jobSpecInitiators'
import jobSpecDefinition from 'utils/jobSpecDefinition'
import Title from 'components/Title'
import PaddedCard from 'components/PaddedCard'
import PrettyJson from 'components/PrettyJson'
import Breadcrumb from 'components/Breadcrumb'
import BreadcrumbItem from 'components/BreadcrumbItem'
import JobRunsList from 'components/JobRunsList'
import Link from 'components/Link'
import CopyJobSpec from 'components/CopyJobSpec'
import matchRouteAndMapDispatchToProps from 'utils/matchRouteAndMapDispatchToProps'
import { connect } from 'react-redux'
import { fetchJobSpec, createJobRun } from 'actions'
import jobSelector from 'selectors/job'
import jobRunsByJobIdSelector from 'selectors/jobRunsByJobId'
import { Divider, Button } from '@material-ui/core'
import ReactStaticLinkComponent from 'components/ReactStaticLinkComponent'
import ErrorMessage from 'components/Notifications/DefaultError'

const styles = theme => ({
  actions: {
    textAlign: 'right'
  },
  definitionTitle: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3
  },
  breadcrumb: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  },
  lastRun: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5
  },
  showMore: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    display: 'block'
  },
  duplicate: {
    margin: theme.spacing.unit
  }
})

const SuccessNotification = ({data}) => (
  <React.Fragment>
    Successfully created job run <BaseLink to={`/jobs/${data.attributes.jobId}/runs/id/${data.id}`}>{data.id}</BaseLink>
  </React.Fragment>
)

const renderJobSpec = ({ classes, job, createJobRun, fetching, fetchJobSpec }) => {
  const definition = jobSpecDefinition(job)
  const handleClick = () => {
    createJobRun(job.id, SuccessNotification, ErrorMessage)
      .then(() => fetchJobSpec(job.id))
  }

  return (
    <Grid container spacing={40}>
      <Grid item xs={8}>
        <PaddedCard>
          <Grid container>
            <Grid item xs={12}>
              <Grid container alignItems='baseline'>
                <Grid item xs={4}>
                  <Typography variant='title' className={classes.definitionTitle}>
                    Definition
                  </Typography>
                </Grid>
                <Grid item xs={8} className={classes.actions}>
                  {isWebInitiator(job.initiators) && (
                    <Button variant='outlined' color='primary' disabled={!!fetching} onClick={handleClick}>
                      Run
                    </Button>
                  )}
                  <Button
                    to={{ pathname: '/jobs/new', state: { definition: definition } }}
                    component={ReactStaticLinkComponent}
                    color='primary'
                    className={classes.duplicate}
                    variant='outlined'>
                    Duplicate
                  </Button>
                  <CopyJobSpec JobSpec={definition} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider light className={classes.divider} />
            </Grid>
            <PrettyJson object={definition} />
          </Grid>
        </PaddedCard>
      </Grid>
      <Grid item xs={4}>
        <PaddedCard>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Typography variant='subheading' color='textSecondary'>ID</Typography>
              <Typography variant='body1' color='inherit'>
                {job.id}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subheading' color='textSecondary'>Created</Typography>
              <Typography variant='body1' color='inherit'>
                {job.createdAt}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={16}>
                <Grid item xs={6}>
                  <Typography variant='subheading' color='textSecondary'>Initiator</Typography>
                  <Typography variant='body1' color='inherit'>
                    {formatInitiators(job.initiators)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subheading' color='textSecondary'>Run Count</Typography>
                  <Typography variant='body1' color='inherit'>
                    {job.runs && job.runs.length}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </PaddedCard>
      </Grid>
    </Grid>
  )
}

const renderLatestRuns = ({ job, classes, latestJobRuns, showJobRunsCount }) => (
  <React.Fragment>
    <Typography variant='title' className={classes.lastRun}>
      Last Run
    </Typography>

    <Card>
      <JobRunsList jobSpecId={job.id} runs={latestJobRuns} />
    </Card>
    {job.runs && job.runs.length > showJobRunsCount && (
      <Link to={`/jobs/${job.id}/runs`} className={classes.showMore}>
        Show More
      </Link>
    )}
  </React.Fragment>
)

const renderFetching = () => <div>Fetching...</div>

const renderDetails = props => {
  if (props.job) {
    return (
      <React.Fragment>
        {renderJobSpec(props)}
        {renderLatestRuns(props)}
      </React.Fragment>
    )
  } else {
    return renderFetching()
  }
}

export class Show extends Component {
  componentDidMount () {
    this.props.fetchJobSpec(this.props.jobSpecId)
  }

  render () {
    const { classes, jobSpecId } = this.props

    return (
      <div>
        <Breadcrumb className={classes.breadcrumb}>
          <BreadcrumbItem href='/'>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>></BreadcrumbItem>
          <BreadcrumbItem>Job ID: {jobSpecId}</BreadcrumbItem>
        </Breadcrumb>
        <Title>Job Spec Detail</Title>

        {renderDetails(this.props)}
      </div>
    )
  }
}

Show.propTypes = {
  classes: PropTypes.object.isRequired,
  latestJobRuns: PropTypes.array.isRequired,
  job: PropTypes.object,
  showJobRunsCount: PropTypes.number
}

Show.defaultProps = {
  latestJobRuns: [],
  showJobRunsCount: 2
}

const mapStateToProps = (state, ownProps) => {
  const jobSpecId = ownProps.match.params.jobSpecId
  const job = jobSelector(state, jobSpecId)
  const latestJobRuns = jobRunsByJobIdSelector(state, jobSpecId, ownProps.showJobRunsCount)
  const fetching = state.fetching.count

  return {
    jobSpecId,
    job,
    latestJobRuns,
    fetching
  }
}

export const ConnectedShow = connect(
  mapStateToProps,
  matchRouteAndMapDispatchToProps({fetchJobSpec, createJobRun})
)(Show)

export default withStyles(styles)(ConnectedShow)
