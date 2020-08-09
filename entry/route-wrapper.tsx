import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { omit } from 'lodash'

export interface IRevaliRouteWrapperProps {
  className?: string
  style?: React.CSSProperties
  routes: any[]
}

const RevaliRouteWrapper: React.FC<IRevaliRouteWrapperProps> = (props) => {
  const { component: Component, routes } = props
  const childNodes = routes.map((r) => (
    <Route
      key={r.path}
      exact={r.exact}
      path={r.path}
      render={(routeProps) => <RevaliRouteWrapper {...routeProps} {...omit(r, ['children'])} routes={r.children} />}
    />
  ))

  return <Component {...props}>{childNodes.length ? <Switch>{childNodes}</Switch> : null}</Component>
}

RevaliRouteWrapper.defaultProps = {
  className: '',
  style: {},
}

export default RevaliRouteWrapper
