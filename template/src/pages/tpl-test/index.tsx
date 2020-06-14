import React from 'react'
import { get } from 'lodash'
import withInitialData, { IWithInitialDataProps } from '@/hoc/withInitialData'

export interface ITplTestProps extends IWithInitialDataProps {
  className?: string
  style?: React.CSSProperties
}

const TplTest: React.FC<ITplTestProps> = ({ children, initialData }) => {
  return (
    <div>
      <h2>Tpl Test Page</h2>
      <div dangerouslySetInnerHTML={{ __html: get(initialData, '[0].show').summary }} />
      {children}
    </div>
  )
}

TplTest.defaultProps = {
  className: '',
  style: {},
}

export default withInitialData(TplTest)
