import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import ReactStaticLinkComponent from 'components/ReactStaticLinkComponent'
import Link from 'components/Link'
import TimeAgo from 'components/TimeAgo'

const styles = theme => ({
  cell: {
    borderColor: theme.palette.divider,
    borderTop: `1px solid`,
    borderBottom: 'none',
    paddingTop: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 4
  }
})

const RecentActivity = ({classes, runs}) => {
  let activity

  if (!runs) {
    activity = (
      <CardContent>
        <Typography variant='body1' color='textSecondary'>...</Typography>
      </CardContent>
    )
  } else if (runs.length === 0) {
    activity = (
      <CardContent>
        <Typography variant='body1' color='textSecondary'>
          No recently activity :(
        </Typography>
      </CardContent>
    )
  } else {
    activity = (
      <Table>
        <TableBody>
          {runs.map(r => (
            <TableRow key={r.id}>
              <TableCell scope='row' className={classes.cell}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant='body1' color='textSecondary'>
                      <TimeAgo>{r.createdAt}</TimeAgo>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Link to={`/jobs/${r.jobId}/runs/${r.id}`}>{r.id}</Link>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={12} sm={8}>
            <Typography variant='headline' component='h2'>
              Activity
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} align='right'>
            <Button
              variant='outlined'
              color='primary'
              component={ReactStaticLinkComponent}
              to={'/jobs/new'}
            >
              New Job
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      {activity}
    </Card>
  )
}

RecentActivity.propTypes = {
  runs: PropTypes.array
}

export default withStyles(styles)(RecentActivity)
