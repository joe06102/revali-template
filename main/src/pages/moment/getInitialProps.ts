import { GetInitialPropsCtx } from 'typings/router'
import { getProfileMoments } from '@/service/sors/server'

export default (ctx: GetInitialPropsCtx) => {
  const params = {
    type: 0, pageNum: 1, pageSize: 30, ...ctx.query, ...ctx.params,
  }

  if (ctx.params.userId) {
    return getProfileMoments(params, ctx)
  }
  return Promise.resolve([])
}
