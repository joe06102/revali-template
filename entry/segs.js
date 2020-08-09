const routerTpl = `
//@ts-ignore
import { RouteConfigItem } from 'typings/router'
import loadable from '@loadable/component'

const RouterConfig: RouteConfigItem[] = [<%= routes %>]

export default RouterConfig
`

const routeTpl = `
{
  exact: <%= exact %>,
  path: '<%= path %>',
  //@ts-ignore
  component: loadable(() => import(/* webpackChunkName: "<%= chunkName %>" */ '@/pages<%= relativePath %>')),
  getInitialProps: <% if(getInitialProps) { %> require('@/pages<%= relativePath %>/getInitialProps').default <%} else { %> <%='null' %> <%}%>,
  getInitialPropsDeep: <%= getInitialPropsDeep %>,
  children: [<%= children %>]
}
`

module.exports = {
  routerTpl,
  routeTpl
}
