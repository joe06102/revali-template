import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter as Router, Switch, Route, matchPath } from 'react-router-dom'
import { Provider } from 'react-redux'
import { get } from 'lodash'
import { ChunkExtractor } from '@loadable/server'
import { RequestHandler } from 'express-serve-static-core'
import { omit } from 'lodash'
import Html from 'revali/server/components/html'
import App from '@/app'
import RouteConfigItem from 'typings/router'
//@ts-ignore
import RouterConfig from 'revali/router'
import createStore from '@/store'
import { client } from 'config/shared/paths'
import { pagePrefix } from 'config/shared/env'
//@ts-ignore
import RouteWrapper from 'revali/route-wrapper'

//针对有子路由的页面必须保证递归匹配
const recursiveMatch = (path, routes, parentAccu = []): [RouteConfigItem, ReturnType<typeof matchPath>][] => {
  const matches = routes.reduce((accu, r) => {
    //由于可能存在路径前缀的情况，必须补齐之后再匹配路由
    const match = matchPath(path, { ...r, path: `${pagePrefix}${r.path}` })

    if (match) {
      accu.push([r, match])
    }

    if (Array.isArray(r.children) && r.children.length) {
      recursiveMatch(path, r.children, parentAccu)
    }

    return accu
  }, parentAccu)

  return matches
}

const ssr: RequestHandler = async (req, res) => {
  const context: any = { initialData: {} }
  const reduxStore = res.locals.store || {}
  const store = createStore(reduxStore)

  const matches = recursiveMatch(req.path, RouterConfig)
  const parentMatch = matches[0]
  const parentMatchDeep = get(parentMatch, '[0].getInitialPropsDeep', 2)

  if (matches?.length && parentMatch) {
    const slicedMatches = matches.slice(0, parentMatchDeep)

    //普通forEach无法在阻塞，只能使用for ... of
    for (const m of slicedMatches) {
      const [matchRoute, routeMatch] = m

      if (matchRoute?.getInitialProps) {
        try {
          context.initialData[matchRoute.path] = await matchRoute?.getInitialProps({
            params: routeMatch.params,
            query: req.query,
            store: res.locals.store,
            req,
            res,
          })
        } catch (err) {
          console.log(err)
        }
      }
    }
  }

  const statsFile = client.manifest
  const extractor = new ChunkExtractor({ statsFile, entrypoints: ['app'] })
  const jsx = extractor.collectChunks(
    <Provider store={store}>
      <Router basename={pagePrefix} location={req.url} context={context}>
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
  )

  const content = ReactDOMServer.renderToString(jsx)

  //如果渲染中返回了redirect组件，则直接返回302
  if (context.url) {
    res.redirect(context.url)
  } else {
    const response = ReactDOMServer.renderToString(
      <Html
        styles={extractor.getStyleElements()}
        scripts={extractor.getScriptElements()}
        state={context.initialData}
        store={store.getState()}
      >
        {content}
      </Html>,
    )

    res.send(response)
  }
}

export default ssr
