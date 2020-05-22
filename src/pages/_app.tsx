import { ApolloProvider, useQuery } from '@apollo/react-hooks'
import { getDataFromTree } from '@apollo/react-ssr'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import {
  AnalyticsListener,
  Error,
  ErrorBoundary,
  FeaturesProvider,
  LanguageProvider,
  Layout,
  Toast,
  ViewerProvider,
} from '~/components'
import { ClientUpdater } from '~/components/ClientUpdater'
import { GlobalDialogs } from '~/components/GlobalDialogs'
import { GlobalStyles } from '~/components/GlobalStyles'
import { QueryError } from '~/components/GQL'
import { ProgressBar } from '~/components/ProgressBar'
import PushInitializer from '~/components/PushInitializer'
import SplashScreen from '~/components/SplashScreen'

import { PATHS } from '~/common/enums'
import { analytics } from '~/common/utils'
import withApollo from '~/common/utils/withApollo'

import { RootQuery } from './__generated__/RootQuery'

const ROOT_QUERY = gql`
  query RootQuery {
    viewer {
      id
      ...ViewerUser
      ...AnalyticsUser
    }
    official {
      ...FeatureOfficial
    }
  }
  ${ViewerProvider.fragments.user}
  ${AnalyticsListener.fragments.user}
  ${FeaturesProvider.fragments.official}
`

// Sentry
import('@sentry/browser').then((Sentry) => {
  /**
   * Initialize
   */
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '' })
})

/**
 * `<Root>` contains components that depend on viewer
 *
 */
const Root = ({
  client,
  children,
}: {
  client: ApolloClient<InMemoryCache>
  children: React.ReactNode
}) => {
  useEffect(() => {
    analytics.trackPage()
  })

  useEffect(() => {
    analytics.identifyUser()
  }, [])

  const router = useRouter()
  const isInAbout = router.pathname === PATHS.ABOUT
  const isInMigration = router.pathname === PATHS.MIGRATION
  const shouldApplyLayout = !isInAbout && !isInMigration

  const { loading, data, error } = useQuery<RootQuery>(ROOT_QUERY)
  const viewer = data?.viewer
  const official = data?.official

  if (loading) {
    return null
  }

  if (error) {
    return <QueryError error={error} />
  }

  if (!viewer) {
    return <Error />
  }

  return (
    <ViewerProvider viewer={viewer}>
      <LanguageProvider>
        <FeaturesProvider official={official}>
          {shouldApplyLayout ? <Layout>{children}</Layout> : children}

          <GlobalDialogs />
          <Toast.Container />
          <ProgressBar />

          <AnalyticsListener user={viewer || {}} />
          <PushInitializer client={client} />
        </FeaturesProvider>
      </LanguageProvider>
    </ViewerProvider>
  )
}

const MattersApp = ({
  Component,
  pageProps,
  apollo,
}: AppProps & { apollo: ApolloClient<InMemoryCache> }) => (
  <ErrorBoundary>
    <ApolloProvider client={apollo}>
      <GlobalStyles />
      <SplashScreen />
      <ClientUpdater />

      <Root client={apollo}>
        <Component {...pageProps} />
      </Root>
    </ApolloProvider>
  </ErrorBoundary>
)

export default withApollo(MattersApp, { getDataFromTree })
