import * as React from 'react'
import { useErrorBoundary } from 'use-error-boundary'
import { Route, useRoute, Redirect, Link } from 'wouter'

import { Global, Loading, Page, DemoPanel, Dot, Error, Title, DotContent } from './styles'
import * as demos from './demos'

const DEFAULT_COMPONENT_NAME = 'Basic'
const visibleComponents: any = demos.Components;

function ErrorBoundary({ children, fallback, name }: any) {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary()
  return didCatch ? fallback(error) : <ErrorBoundary key={name}>{children}</ErrorBoundary>
}

function Demo() {
  const [match, params] = useRoute('/demo/:name')
  const compName = match ? params.name : DEFAULT_COMPONENT_NAME
  const { Component } = visibleComponents.get(compName);

  return (
    <ErrorBoundary key={compName} fallback={(e: any) => <Error>{e}</Error>}>
      <Component />
    </ErrorBoundary>
  )
}

function Sidebar() {
  const [match, params] = useRoute('/demo/:name')
  if (!match) return null

  let keys: string[] = Array.from( visibleComponents.keys() );

  return (
    <>
      <DemoPanel>
        {keys.map((name: string)=> {
          const background = params.name === name ? '#ff91ee' : ''
          const color = params.name === name ? 'rgb(23, 23, 23)' : ''

          return <Link key={name} to={`/demo/${name}`} >
            <Dot style={{ background }}>
              <DotContent style={{ color }}>
                {name}
              </DotContent>
            </Dot>
          </Link>
        })}
      </DemoPanel>
      <Title>{params.name}</Title>
    </>
  )
}

export default function App() {
  const dev = new URLSearchParams(location.search).get('dev')

  return (
    <>
      <Global />
      <Page>
        <React.Suspense fallback={<Loading />}>
          <Route path="/" children={<Redirect to={`/demo/${DEFAULT_COMPONENT_NAME}`} />} />
          <Route path="/demo/:name">
            <Demo />
          </Route>
        </React.Suspense>
        {dev === null && <Sidebar />}
      </Page>
    </>
  )
}
