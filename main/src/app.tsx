import React from 'react'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import { HashLink as Link } from 'react-router-hash-link'
import { hot } from 'react-hot-loader/root'
import { get } from 'lodash'
import { IStoreState } from 'typings/store'
import Navbar from 'components/Navbar'
import Dropdown from '@/components/Dropdown'
import Avatar from 'components/Avatar'
import MenuItems from '@/menu-items'
import './app.less'

const App: React.FC = ({ children }) => {
  const user = useSelector<IStoreState, IStoreState['user']>((state) => state?.user)

  console.log('[测试ts-plugin-import的兼容性]', get({}, 'a'))
  console.log('[测试provide-plugin兼容性]', window.name, window.document.contentType, window.navigator.userAgent)

  return (
    <div className='app-wrap'>
      <Helmet>
        <title>Revali's Gale</title>
        <meta name='author' content='revali' />
        <meta name='description' content='revali react ssr' />
      </Helmet>
      <Navbar className='navbar'>
        <h1>
          <img alt='logo' className='logo' src={require('@/imgs/logo.png')} />
          <span>Revali's Gale</span>
        </h1>
        <Avatar user={user} />
      </Navbar>
      <section className='section'>
        <section className='section-left'>
          {MenuItems.map((item, index) => (
            <Dropdown key={item.to} title={item.name} expand={index === 0}>
              {item?.children?.map((c) => (
                <Link key={c.to} to={c.to}>
                  <div>{c.name}</div>
                </Link>
              ))}
            </Dropdown>
          ))}
        </section>
        <section className='section-right'>{children}</section>
      </section>
    </div>
  )
}

export default hot(App)
