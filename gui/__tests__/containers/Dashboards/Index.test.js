/* eslint-env jest */
import React from 'react'
import accountBalanceFactory from 'factories/accountBalance'
import syncFetch from 'test-helpers/syncFetch'
import createStore from 'connectors/redux'
import { mount } from 'enzyme'
import { Router } from 'react-static'
import { Provider } from 'react-redux'
import { ConnectedIndex as Index } from 'containers/Dashboards/Index'

const classes = {}
const mountIndex = (opts = {}) => (
  mount(
    <Provider store={createStore()}>
      <Router>
        <Index classes={classes} pageSize={opts.pageSize} />
      </Router>
    </Provider>
  )
)

describe('containers/Dashboards/Index', () => {
  it('renders the recent activity, account balances & recently created jobs', async () => {
    expect.assertions(5)

    const recentlyCreatedJobsResponse = {
      data: [
        {
          id: 'job_b',
          type: 'specs',
          attributes: {
            id: 'job_b',
            createdAt: (new Date()).toISOString()
          }
        },
        {
          id: 'job_a',
          type: 'specs',
          attributes: {
            id: 'job_a',
            createdAt: (new Date()).toISOString()
          }
        }
      ]
    }
    global.fetch.getOnce('/v2/specs?size=2&sort=-createdAt', recentlyCreatedJobsResponse)

    const accountBalanceResponse = accountBalanceFactory(
      '10123456000000000000000',
      '7467870000000000000000'
    )
    global.fetch.getOnce('/v2/user/balances', accountBalanceResponse)

    const wrapper = mountIndex()

    await syncFetch(wrapper)
    expect(wrapper.text()).toContain('Link Balance7.467870k')
    expect(wrapper.text()).toContain('Ether Balance10.123456k')

    await syncFetch(wrapper)
    expect(wrapper.text()).toContain('Recently Created Jobs')
    expect(wrapper.text()).toContain('job_bCreated just now')
    expect(wrapper.text()).toContain('job_aCreated just now')
  })
})
