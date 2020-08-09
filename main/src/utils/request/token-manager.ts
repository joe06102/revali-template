import { PromiseResolvedParam } from 'typescript-head-to-toe'
import { clientRequest } from './request'

export interface ITokenManager {
  token: string
  timer?: number
  getTokenAsync: () => Promise<string>
}

type RequestResponse = PromiseResolvedParam<ReturnType<typeof clientRequest>>

const HEART_BEAT = 300000 //5分钟一次心跳
const MAX_RETRIES = 3
const INVALID_TOKEN_CODE = 'TD0300000011'

function getTokenFactory() {
  let fails = 0
  const getTokenAsync: () => Promise<RequestResponse> = () => clientRequest({ type: 'sors', path: '/createToken', method: 'post' })
  const handleRecursiveRequest: (res: RequestResponse) => Promise<any> | never = (res) => {
    if (res.code === 'success' && res.data) {
      fails = 0 //成功之后将之前失败计数清0
      return res.data
    }

    if (res.code === INVALID_TOKEN_CODE && fails < MAX_RETRIES) {
      fails += 1
      return getTokenAsync().then(handleRecursiveRequest)
    }

    //超过最大重试次数
    return Promise.reject(new Error(res.message))
  }

  return () => getTokenAsync().then(handleRecursiveRequest)
}

function getTokenManager(): ITokenManager {
  const w = window as any
  if (w.tokenManager) {
    return w.tokenManager as ITokenManager
  }
  const tm = { token: '', timer: 0 } as ITokenManager
  const getTokenAsync = getTokenFactory().bind(tm)
  const heartbeat = () => {
    getTokenAsync()
      .then((refreshToken: string) => {
        if (refreshToken) {
          tm.token = refreshToken
        }
      })
      .finally(() => {
        tm.timer = window.setTimeout(heartbeat, HEART_BEAT)
      })
  }

  //第一次心跳
  //todo-race condition
  heartbeat()

  tm.getTokenAsync = () => {
    if (tm.token) {
      return Promise.resolve(tm.token)
    }

    return getTokenAsync().then((token: string) => {
      tm.token = token
    }).catch((err: Error) => {
      console.log('[getTokenAsync failed]: ', err.message)
    })
  }

  w.tokenManager = tm

  return tm
}

export default getTokenManager
