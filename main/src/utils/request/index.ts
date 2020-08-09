import { clientRequest as CRequest, isSimpleRequest } from './request'
import getTokenManager from './token-manager'

export {
  RequestType,
  IRequestOption,
  serverRequstFactory,
  getResponseData,
} from './request'

export const clientRequest: typeof CRequest = (options, params) => {
  const tokenManager = getTokenManager()

  if (isSimpleRequest(options)) {
    return CRequest(options, params)
  }

  return tokenManager.getTokenAsync()
    .then((token: string) => CRequest(options, { ...params, JUTE_TOKEN: token }))
}

export const jsonP = <T>(url: string, mapper: (win: Window) => T): Promise<T> => {
  let handlers: any[] = []
  const promise = new Promise<T>((resolve, reject) => {
    handlers = [resolve, reject]
  })
  let timeout: any = 0
  const head = document.getElementsByTagName('head')[0]
  const script = document.createElement('script')

  script.type = 'text/javascript'
  script.charset = 'utf-8'
  script.async = true

  function onScriptComplete() {
    script.onerror = null
    script.onload = null

    if (timeout) {
      clearTimeout(timeout)
    }

    const resolve = handlers[0]
    resolve(mapper(window))
  }

  function onScriptError(
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    err?: Error,
  ): void {
    script.onerror = null
    script.onload = null
    clearTimeout(timeout)

    const reject = handlers[1]
    reject(err)
  }

  timeout = setTimeout(onScriptComplete, 120000) //设置2分钟超时
  script.onerror = onScriptError
  script.onload = onScriptComplete
  script.src = url

  head.appendChild(script)

  return promise
}
