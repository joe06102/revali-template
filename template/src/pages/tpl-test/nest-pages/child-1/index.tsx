import React from 'react'
import { get } from 'lodash'
import withInitialData, { IWithInitialDataProps } from '@/hoc/withInitialData'

export interface IChild1Props extends IWithInitialDataProps {
  className?: string
  style?: React.CSSProperties
}

const Child1: React.FC<IChild1Props> = (props) => {
  const { initialData } = props

  return (
    <div>
      <h3>Tpl test child 1 page</h3>
      <div dangerouslySetInnerHTML={{ __html: get(initialData, '[1].show').summary }} />
    </div>
  )
}

Child1.defaultProps = {
  className: '',
  style: {},
}

export default withInitialData(Child1)
