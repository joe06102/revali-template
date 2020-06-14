import { clientRequest as request, getResponseData } from '@/utils/request'

export const getListDataAsync = (params: Record<string, any>) => {
  return request({
    type: 'sors',
    method: 'get',
    path: '/user/message/unreadList',
  }, params).then(getResponseData)
}

export function getProfileMoments(params: any) {
  return request(
    {
      type: 'sors',
      path: '/user/timeline/list',
      method: 'get',
    },
    params,
  ).then<any>(getResponseData)
}
