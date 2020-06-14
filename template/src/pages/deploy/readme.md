### 项目部署 <a id="deploy"></a>
整体可以采用 Nginx + PM2，Nginx用于提供静态资源(或者load balance)，PM2则作为Node应用的容器。

> 打包前记得配置对应的资源 [publicPath](/#customize)

#### 打包

```shell
npm run prod

## 在根目录的dist文件夹下会生成如下文件夹

├── assets      //生成的静态资源，需要部署到cdn
│   ├── css
│   ├── imgs
│   └── js
├── resources   //共享的资源文件，需要部署到node服务
└── server      //服务器端文件夹，需要拷贝到服务器，并用pm2启动
    ├── css
    └── imgs
```

#### pm2设置
通过配置文件 `ecosystem.config.js`，可以快速设置pm2的参数，例如服务名称、监听文件改动、添加环境变量、日志文件等。详细配置参考 [pm2官网](https://pm2.keymetrics.io/docs/usage/application-declaration/)。

配置文件示例：
```javascript
module.exports = {
  apps: [{
    name: 'revali-gale',
    script: './app.js',
    source_map_support: true,
    watch: ['*.js'],
    watch_delay: 3000,
    ignore_watch: ['node_modules'],
    env: {
      NODE_ENV: 'production',
      PORT: 8825,
    },
    error_file: '/var/www/logs/revali-gale/err.log',
    out_file: '/var/www/logs/revali-gale/out.log',
    log_file: '/var/www/logs/revali-gale/all.log',
  }],
}
```
