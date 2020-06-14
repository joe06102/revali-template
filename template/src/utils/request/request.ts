import axios from 'axios'
import { get } from 'lodash'
import { sign } from 'revali-utils'
import { SIGN_KEY } from '@/constants/KEYS'
import { Request, Response } from 'express-serve-static-core'
import { prefixMap, host } from 'config/shared/env'

export type RequestType = 'sors' | 'cors'

export interface IRequestOption {
  method: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
  type: RequestType
  path: string
}

export interface IRevaliResponse<T = any> {
  code: string
  message?: string
  data: T
}

const getRequestPath = (options: IRequestOption) => {
  if (
    process.env.IS_BROWSER
    && process.env.NODE_ENV === 'development'
    && options.type === 'sors') {
    return `/proxy${prefixMap[options.type]}${options.path}`
  }

  return `${prefixMap[options.type]}${options.path}`
}

export const isSimpleRequest = (options: IRequestOption) => {
  return (
    options.method === 'get'
    || options.method === 'delete'
    || options.method === 'head'
    || options.method === 'options'
  )
}

// eslint-disable-next-line max-len
export const clientRequest = (options: IRequestOption, params?: any, config?: any): Promise<IRevaliResponse> => {
  const pathname = getRequestPath(options)
  const isSimple = isSimpleRequest(options)
  const axiosConfig = { ...config }
  const data = isSimple ? null : params

  if (isSimple) {
    //简单请求所有的params经过签名之后统一给config.params，提交时全部被序列化为query string
    axiosConfig.params = sign(params, SIGN_KEY)
  } else {
    //复杂请求默认querystring只有签名返回的相关参数
    axiosConfig.params = sign({}, SIGN_KEY)
  }

  if (options.type === 'cors') {
    axiosConfig.withCredentials = false
  }

  let requestor: Promise<any> = null

  if (isSimple) {
    //@ts-ignore
    requestor = axios[options.method](pathname, axiosConfig)
  } else {
    //@ts-ignore
    requestor = axios[options.method](pathname, data, axiosConfig)
  }

  return requestor.then((response: any) => response.data)
}

export const getServerAxiosInstance = (
  req: Request, res: Response,
  options: IRequestOption,
) => axios.create({
  baseURL: host,
  headers: {
    cookie: options.type === 'sors' ? req.headers.cookie || '' : '',
  },
})

export const serverRequstFactory = (req: Request, res: Response) => (
  options: IRequestOption,
  params?: any,
  config?: any,
): Promise<IRevaliResponse> => {
  const serverRequest = getServerAxiosInstance(req, res, options)
  const pathname = getRequestPath(options)
  const isSimple = isSimpleRequest(options)
  const axiosConfig = { ...config }
  const data = isSimple ? null : params

  if (isSimple) {
    //简单请求所有的params经过签名之后统一给config.params，提交时全部被序列化为query string
    axiosConfig.params = sign(params, SIGN_KEY)
  } else {
    //复杂请求默认querystring只有签名返回的相关参数
    axiosConfig.params = sign({}, SIGN_KEY)
  }

  if (options.type === 'cors') {
    axiosConfig.withCredentials = false
  }

  let requestor: Promise<any> = null

  if (isSimple) {
    //@ts-ignore
    requestor = serverRequest[options.method](pathname, axiosConfig)
  } else {
    //@ts-ignore
    requestor = serverRequest[options.method](pathname, data, axiosConfig)
  }

  return requestor.then((response: any) => response.data)
}

export const getResponseData = <T extends IRevaliResponse>(
  res: T,
): Promise<any> => {
  if (get(res, 'code') !== 'success') {
    return Promise.reject(new Error(get(res, 'message')))
  }
  return Promise.resolve<any>(get(res, 'data'))
}
