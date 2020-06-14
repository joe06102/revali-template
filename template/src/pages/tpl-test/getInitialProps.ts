import { GetInitialPropsCtx } from 'typings/router'
import { getHomeDataAsync } from '@/service/cors/server'

export default (ctx: GetInitialPropsCtx) => {
  const params = { q: 'pokemon', ...ctx.query }
  return getHomeDataAsync(params, ctx)
}
