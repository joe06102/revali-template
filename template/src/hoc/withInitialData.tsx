import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

export interface IWithInitialDataProps extends
  RouteComponentProps<{}, { statusCode?: number, initialData: any }>, SSRPage {
  path: string
}

function WithInitialData<
  P extends IWithInitialDataProps
>(
  PageComponent: React.ComponentType<P>,
) {
  const WithInitialDataComponent: React.FC<P> = (props) => {
    const { staticContext, path } = props
    let data = null

    if (process.env.IS_SERVER) {
      data = staticContext?.initialData[path]
    } else {
      data = window.initialData[path]

      window.initialData[path] = null
    }

    return <PageComponent initialData={data} {...props} />
  }

  return WithInitialDataComponent
}

export default WithInitialData
