import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Title from 'components/Title'
import JobList from 'components/JobList'
import ReactStaticLinkComponent from 'components/ReactStaticLinkComponent'
import matchRouteAndMapDispatchToProps from 'utils/matchRouteAndMapDispatchToProps'
import jobsSelector from 'selectors/jobs'
import { fetchJobs } from 'actions'

export class Index extends Component {
  render () {
    const {props} = this
    return (
      <div>
        <Grid container alignItems='center' >
          <Grid item xs={9}>
            <Title>Jobs</Title>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify='flex-end' >
              <Grid item>
                <Button variant='outlined' color='primary' component={ReactStaticLinkComponent} to={'/jobs/new'}>
                  New Job
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <JobList
              jobs={props.jobs}
              jobCount={props.jobCount}
              pageSize={props.pageSize}
              fetchJobs={props.fetchJobs}
              history={props.history}
              match={props.match}
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

Index.propTypes = {
  jobCount: PropTypes.number.isRequired,
  jobs: PropTypes.array,
  pageSize: PropTypes.number
}

Index.defaultProps = {
  pageSize: 10
}

const mapStateToProps = state => {
  return {
    jobCount: state.jobs.count,
    jobs: jobsSelector(state)
  }
}

export const ConnectedIndex = connect(
  mapStateToProps,
  matchRouteAndMapDispatchToProps({fetchJobs})
)(Index)

export default ConnectedIndex
