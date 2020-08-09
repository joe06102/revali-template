import React, { useState, useEffect } from 'react'
import { getListDataAsync } from '@/service/sors'
import './index.less'

export interface IAboutProps {
  className?: string
  style?: React.CSSProperties
}

const About: React.FC<IAboutProps> = (props) => {
  const [data, setData] = useState({ result: [] })

  useEffect(() => {
    getListDataAsync({ pageNum: 1, pageSize: 20 })
      .then((items: any) => setData(items))
  }, [])

  return (
    <div className='about-wrap'>
      <h3>纯粹的客户端渲染，服务端不取数据 (需要在dxy.net/bbs页面下登录后) </h3>
      <div>
        {
          data?.result?.map((item) => <div key={item.id}>{item.lastMessageSimple}</div>)
        }
      </div>
    </div>
  )
}

About.defaultProps = {
  className: '',
  style: {},
}

export default About
