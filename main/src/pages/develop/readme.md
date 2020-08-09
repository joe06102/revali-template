### 语言 <a id="lang"></a>
默认语言为**Typescript**(包括服务端和客户端)，也支持混用Javascript。

### 类型定义
类型定义全部在typings目录。其中 `global.d.ts` 包含了全局的类型定义，使用时不需要引入。其余类型需使用 `import` 正常引入。

### 路由 <a id="route"></a>
路由会依据`pages`目录自动生成，如果要使用嵌套路由，可以在该页面下再新建一个`nest-pages`的目录，然后在下面新建子页面。
子路由默认会带上父路由的路径。

#### 路由配置
1. 页面如果需要传参，可以在该页面目录下新建一个`config.js`，以`commonjs`方式导出参数。
1. 如果某个特定路由需要路径前缀，和传参类似，在config里导出`prefix`变量。
1. 首页重定向，可以通过在pages根目录新建一个`index.tsx`，然后渲染一个<Redirect />组件(在开启ssr的情况下，服务器会以302的方式重定向)
1. 路由匹配模式：
    * 默认所有路由均为**严格匹配模式** (对应react-router exact: true)
    * 如果存在子页面，则父路由默认为**非严格模式**
    * 如果想自定义匹配模式，可以在1中的`config.js`文件中导出变量，具体例子参考结尾例子。

路由配置：
```javascript
const params = '/:userId'
const prefix = '/demo'

module.exports = {
  params,
  prefix,
  exact: false //自定义非严格匹配
}
```

首页重定向：
```typescript
import React from 'react'
import { Redirect } from 'react-router-dom'

const Index: React.FC = () => {
  //将/重定向回/basic
  return <Redirect to='/basic' />
}

export default Index
```

### CSS预处理 <a id="css"></a>
默认支持 `css` 和 `less` 2种语法。默认不开启 `css-module`，如果需要，在样式文件名后添加 `.module.less`即可。

所有全局样式统一放到 `src > shared > styles` 目录下，并在`app.less`中统一导入。

>推荐**不使用**css-modules，因为会增加不必要的样式字符串，尽量通过规范的命名来避免冲突。

### 数据获取 <a id="data"></a>
所有接口相关的代码都放到 `service` 目录下。并且按照页面来划分，每个页面下分别有2个文件，`index.ts` 和 `server.ts`。

#### 客户端 vs 服务端
按照请求环境，我们把接口分成了**2类**，一类是正常在客户端执行的请求，放在 `index.ts`文件中；另一类是在服务端渲染时执行的请求，放在 `index.server.ts`。

例如：

index.ts: 
```typescript
import { clientRequest as request } from '@/utils/request'

export const getHomeDataAsync = (params: Record<string, any>) => {
  return request({
    type: 'cors',
    method: 'get',
    path: 'http://api.tvmaze.com/search/shows',
  }, params)
}
```

server.ts:
```typescript
import { GetInitialPropsCtx } from 'typings/router'
import { serverRequstFactory } from '@/utils/request'

export const getHomeDataAsync = (
  params: Record<string, any>,
  ctx: GetInitialPropsCtx,
) => {
  const request = serverRequstFactory(ctx.req, ctx.res)
  return request({
    method: 'get',
    path: 'http://api.tvmaze.com/search/shows',
    type: 'cors',
  }, params)
}
```

两者的区别在于在服务端请求的方法，会传入一个额外的参数 **ctx**，表示当前请求的上下文，类型定义如下：
```typescript
export interface GetInitialPropsCtx {
  params?: Record<string, any>
  query?: Record<string, any>
  store?: IStoreState,
  req?: Request
  res?: Response
}
```

并且在方法内部，需要先通过 `serverRequstFactory` 方法构造一个**请求实例**，然后才能正常调用该请求。
```typescript
  const request = serverRequstFactory(ctx.req, ctx.res)
  return request({
    method: 'get',
    path: 'http://api.tvmaze.com/search/shows',
    type: 'cors',
  }, params)
```

#### 全局数据 vs 局部数据
按照数据用途，我们又可以分为2种，**全局数据**和**局部数据**。
全局数据例如用户信息，可能需要在所有接口请求之前请求(例如未登录重定向)。而局部数据则只是当前页面所需的**主要数据**。

对于全局请求，默认在 `src > shared > service > global` 下，同上，区分服务器端和客户端。

对于**局部数据**，规定只能在对应页面新增一个 **`getInitialProps.ts`** 文件，并默认导出一个函数，用于服务端数据的请求。服务端会将该方法的返回结果传递给当前页面。

例如 `pages/moment/getInitialProps.ts` 文件：
```typescript
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
```

在对应页面组件中获取数据时，必须通过模板中自带的 `WithInitialData` HOC对组件进行包裹：

```typescript
import React, { useEffect } from 'react'
import WithInitialData from '@/hoc/withInitialData'

const Home: React.FC<IHomeProps> = (props) => {
  const { initialData } = props
  const { posts, getHomePostsAsync } = useHome(initialData)

  useEffect(() => {
    //在dom挂载时必须要做一个判断，当服务端渲染失败时，可以降级为客户端渲染
    if (!initialData?.length) {
      getHomePostsAsync()
    }
  }, [getHomePostsAsync, initialData, query.q])

  return null
}

Home.defaultProps = {
  className: '',
  style: {},
}

//必须通过这个HOC包裹，否则无法直接拿到服务端数据
export default WithInitialData<IHomeProps>(Home)
```

#### 子页面的数据请求
子页面也支持在服务端渲染，方法同父页面，在子页面下新增一个 **`getInitialProps.ts`** 文件即可。

由于数据是在服务端请求，为提高性能，建议页面的数据请求不要超过3层，可以通过路由配置中的`config.js`文件，配置**最大服务端请求深度**。

`config.js`:

```javascript
module.exports = {
  getInitialPropsDeep: 2,  
}
```

### 集成Redux <a id="redux"></a>
模板默认只有用户信息一种全局数据，如果需要额外新增，请将接口写到`global > server.ts` 下，并在 `src > server > middlewares > global.ts` 中添加数据请求代码。例如：
```typescript
import { RequestHandler } from 'express-serve-static-core'
import { getUserInfoAsync } from '@/service/global/server'

const store: Record<string, any> = {}

try {
  const user = await getUserInfoAsync({ req, res })
  //如果需要新增全局状态，可以写在这里，并将结果挂载到store对象上
  //属性名务必和combineReducer中的保持一致，否则将无法生效

  store.user = user
} catch (err) {
  console.log(err)
} finally {
  res.locals.store = store
  next()
}
```

### 页面重定向 <a id="redirect"></a>
对于部分需要满足条件才能访问的页面，可以通过在`render`中返回 `<Redirect />`组件来实现服务端的重定向。
