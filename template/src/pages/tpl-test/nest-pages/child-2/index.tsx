import React from 'react'

export interface IChild2Props {
  className?: string
  style?: React.CSSProperties
}

const Child2: React.FC<IChild2Props> = (props) => {
  return <div>child-page-2</div>
}

Child2.defaultProps = {
  className: '',
  style: {},
}

export default Child2
