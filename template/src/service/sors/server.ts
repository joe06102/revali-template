import { GetInitialPropsCtx } from 'typings/router'
import { serverRequstFactory } from '@/utils/request'
import { transformMoment } from '@/pages/moment/hooks/useMoment'

export function getProfileMoments(params: any, ctx: GetInitialPropsCtx) {
  const request = serverRequstFactory(ctx.req, ctx.res)
  return request(
    {
      type: 'sors',
      path: '/user/timeline/list',
      method: 'get',
    },
    params,
  ).then<any>((res: any) => res.data?.result?.map((m: any) => transformMoment(m)))
}
