import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { omit } from 'lodash'
import { loadableReady } from '@loadable/component'
import App from '@/app'
import createStore from '@/store'
import { pagePrefix } from 'config/shared/env'
//@ts-ignore
import RouteWrapper from 'revali/route-wrapper'
//@ts-ignore
import RouterConfig from 'revali/router'

loadableReady(() => {
  ReactDOM.hydrate(
    <Provider store={createStore(window.initialStore)}>
      <Router basename={pagePrefix}>
        <App>
          <Switch>
            {RouterConfig.map((r: any) => (
              <Route
                key={r.path}
                exact={r.exact}
                path={r.path}
                render={(props) => <RouteWrapper {...props} {...omit(r, ['children'])} routes={r.children} />}
              />
            ))}
          </Switch>
        </App>
      </Router>
    </Provider>,
    document.querySelector('#root'),
  )
})
