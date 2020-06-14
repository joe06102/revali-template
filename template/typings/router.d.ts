import { RouteProps } from 'react-router-dom'
import { Request, Response } from 'express-serve-static-core'
import { IStoreState } from './store'

export interface RouteConfigItem extends Omit<RouteProps, 'path'> {
  path: string
  relativePath: string
  params?: string
  prefix?: string
  exact?: boolean
  page: string
  chunkName: string
  getInitialProps?: (params: GetInitialPropsCtx) => Promise<any>
  getInitialPropsDeep: number
  children: RouteConfigItem[]
}

export interface GetInitialPropsCtx {
  params?: Record<string, any>
  query?: Record<string, any>
  store?: IStoreState,
  req?: Request
  res?: Response
}
