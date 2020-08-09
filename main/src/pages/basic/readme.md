### 快速上手 <a id="quickstart"></a>

- `npm install` 安装项目依赖
- `npm run start:dev` 开启本地开发服务器，其中dev表示当前请求的接口环境
- 打开控制台输出的url

> 模板默认配置的接口及路径皆为均为**revali-gale**相关的域名。<br>
> 开启后本地会开2个服务，默认为**8825**(ssr服务端口)，**8824**(webpack开发服务器端口)。<br>
> 部分demo页面可能需要cookie，推荐将local.revali.net指向本机地址。

### 目录结构 <a id="structure"></a>
项目整体基于”约定大于配置“的思想，所以不要修改下列文件夹的名称。

例如下面的config配置文件夹中，client和server分别用于放置客户端和服务区端相关的webpack配置。shared文件夹中则放置两者共享的一些配置，比如一些loader和plugin等。

```shell
├── config              //相关webpack配置
│   ├── client 
│   ├── server
│   └── shared
├── dist                //编译或者本地开发时自动生成的目录
│ 
├── resources           //独立的资源文件，不参与编译，但是需要放到生产环境
│ 
├── script              //预编译、开发、发布相关的脚本文件
│ 
├── src                 //业务代码
│   ├── alias           //服务端需要mock的模块
│   ├── components      //公共组件
│   ├── constants       //公共常量
│   ├── hoc             //公共hoc组件
│   ├── hooks           //公共hooks
│   ├── imgs            //公共图片资源
│   ├── pages           //所有页面组件
│   ├── service         //所有接口服务
│   ├── store           //redux相关
│   ├── styles          //公共样式
│   └── utils           //公共帮助库
│
└── typings            //项目级别共享的类型，globa.d.ts为全局类型，不需要显示引入，其它类型均需要引入
```

### 配置<a id="customize"></a>

#### 环境变量
模板中默认包含下面4个环境变量，可以通过 `process.env.xxx` 来访问：
- `IS_SERVER: boolean`: 当前代码块的执行环境是否为服务器
- `IS_BROWSER: boolean`: 当前代码块的执行环境是否为浏览器
- `NODE_ENV: 'development' | 'production'`: 当前node环境
- `API_ENV: 'dev' | 'test' | 'uat' | 'prod'` 当前接口环境

**位置**：`config > shared > plugins.js`

```javascript
//暴露给浏览器端的NODE环境变量
const ClientDefineVariables = {
  'process.env.IS_SERVER': 'false',
  'process.env.IS_BROWSER': 'true',
  'process.env.API_ENV': JSON.stringify(process.env.API_ENV),  
}

//暴露给服务器端的NODE环境变量
const ServerDefineVariables = {
  'process.env.IS_SERVER': 'true',
  'process.env.IS_BROWSER': 'false',
  'process.env.API_ENV': JSON.stringify(process.env.API_ENV),  
}
```

#### publicPath
用于修改所有静态资源打包完成后的前缀路径，例如改为公司cdn所在域名。

**位置**：`config > shared > paths.js`

```javascript
const sharedPath = {
  assets: resolve('dist/assets'),
  css: resolve('dist/assets/css'),
  js: resolve('dist/assets/js'),
  publicPath: isDEV ? '/statics/' : '//assets.dxycdn.com/gitrepo/' //修改此处即可
}
```

#### 路径前缀
某些项目在部署后可能会挂载特定的路径下面，并且前后端对应的路径前缀也不同。

例如新版社区所有页面均挂载在`revali.net/revali/gale-xxx/pc`前缀下，但是对应的接口则在 `revali.net/revali/gale-xxx`前缀下。

**位置**：`config > shared > env.js`

```javascript
//不同接口环境顶级域名映射
const TOPDOMAIN_MAP = {
  dev: 'net',
  test: 'net',
  uat: 'cn',
  prod: 'cn'
}

//不同接口环境同域路径前缀的映射
const API_PREFIX_MAP = {
  dev: '/revali/gale-dev',
  test: '/revali/gale-test',
  uat: '/revali/gale-uat',
  prod: '/revali/gale'
}

//不同环境前端页面路径前缀的映射
const PAGE_PREFIX_MAP = {
  dev: '/revali/gale-dev/pc',
  test: '/revali/gale-test/pc',
  uat: '/revali/gale-uat/pc',
  prod: '/revali/gale/pc'
}
```

#### 本地代理
对于不支持跨域的请求，可以在本地配置相应代理来转发请求。具体配置项参考 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#http-proxy-middleware-options)。

**位置**：`config > client > proxy.js`

```javascript
module.exports = {
  logLevel: 'debug',
  target: env.host,
  pathRewrite: {
    '^/proxy': '',
  },
  changeOrigin: true,
  secure: false,
  headers: {
    Referer: env.host,
  },
}
```

#### Webpack别名
用于指定项目某个目录的别名。

**位置**：`config > shared > misc.js`

```javascript
//默认包含以下别名
const alias = {
  '@': resolve('src'),
  styles: resolve('src/shared/styles'),
  components: resolve('src/shared/components'),
  config: resolve('config')
}
```

#### 对于不支持SSR的第三方库

某些第三方库可能在开发的时候就没考虑到服务端渲染的兼容性，比如直接使用DOM或者BOM API，对于这种库，可以采用上面 **webpack别名** 的方法来mock。

例如我们的 `revali-utils` 库，存在下面的一段代码：

```javascript
// 直接使用了window.location对象，在node端会报错。
const isTestEnvironment = () => {
  return /\.net$/.test(location.hostname);
}
```

解决办法：
- 在 `src > server > alias` 目录下，新建一个 `revali-utils`的文件夹
- 参考原本node_modules中该库的接口，mock其导出的api：

```typescript
// lib/openScheme.ts
export const openScheme = () => {
  return ''
}

openScheme.scheme = () => {
  return Promise.resolve()
}

// lib/sign.ts
export const sign = (params: Record<string, any>) => {
  return params
}

// index.ts
export * from './lib/sign'
export * from './lib/openScheme'

```

- 针对**服务端webpack配置**(配置文件：`config > shared > misc.js`)，将该模块的别名指向 `src > server > alias` 对应目录：

```javascript
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']
const clientAlias = {
  '@': resolve('src'),
  styles: resolve('src/shared/styles'),
  components: resolve('src/shared/components'),
  config: resolve('config')
}
const serverAlias = {
  ...clientAlias,
  'revali-utils': resolve('src/alias/revali-utils')
}

module.exports = {
  clientResolve: {
    extensions,
    alias: clientAlias,
  },
  serverResolve: {
    extensions,
    alias: serverAlias,
  }
}
```

- 最后，修改**服务端webpack配置**(配置文件：`config > server > server.config.base.js`)中 `nodeExternals` 配置，将mock模块添加到白名单中：

```javascript
  externals: [
    nodeExternals({
      whitelist: [
        /\.(css|less)$/,
        'revali-utils',
      ],
    })
  ],
```
> 对于某个导出的接口可能不仅仅需要mock，而是要用到其真实的方法，例如上面的sign方法，此时可以通过单独import第三方包具体目录下的该方法，避开那些不支持ssr的模块。<br/> 如果该方法的模块也不支持ssr，暂时可以先copy一份**源代码(非打包后的)**到mock目录。
