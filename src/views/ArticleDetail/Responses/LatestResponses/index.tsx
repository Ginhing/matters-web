import jump from 'jump.js'
import _differenceBy from 'lodash/differenceBy'
import _get from 'lodash/get'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'

import {
  EmptyResponse,
  List,
  Spinner,
  Switch,
  Title,
  Translate,
  useEventListener,
  usePublicQuery,
  usePullToRefresh,
  useResponsive,
  ViewerContext,
  ViewMoreButton,
} from '~/components'
import { QueryError } from '~/components/GQL'

import { REFETCH_RESPONSES, UrlFragments } from '~/common/enums'
import {
  dom,
  filterResponses,
  getQuery,
  mergeConnections,
  unshiftConnections,
} from '~/common/utils'

import ResponseArticle from '../ResponseArticle'
import ResponseComment from '../ResponseComment'
import styles from '../styles.css'
import { LATEST_RESPONSES_PRIVATE, LATEST_RESPONSES_PUBLIC } from './gql'

import { LatestResponsesPrivate_nodes_Comment } from './__generated__/LatestResponsesPrivate'
import {
  LatestResponsesPublic,
  LatestResponsesPublic_article_responses_edges_node,
} from './__generated__/LatestResponsesPublic'

const RESPONSES_COUNT = 15

type ResponsePublic = LatestResponsesPublic_article_responses_edges_node
type ResponsePrivate = LatestResponsesPrivate_nodes_Comment
type Response = ResponsePublic & Partial<Omit<ResponsePrivate, '__typename'>>

const LatestResponses = () => {
  const viewer = useContext(ViewerContext)
  const isMediumUp = useResponsive('md-up')
  const router = useRouter()
  const mediaHash = getQuery({ router, key: 'mediaHash' })
  const [articleOnlyMode, setArticleOnlyMode] = useState<boolean>(false)
  const [storedCursor, setStoredCursor] = useState<string | null>(null)

  /**
   * Fragment Patterns
   *
   * 0. ``
   * 1. `#comment`
   * 2. `#parentCommentId`
   * 3. `#parentComemntId-childCommentId`
   */
  let fragment = ''
  let parentId = ''
  let descendantId = ''
  if (process.browser) {
    fragment = window.location.hash.replace('#', '')
    parentId = fragment.split('-')[0]
    descendantId = fragment.split('-')[1]
  }

  /**
   * Data Fetching
   */
  // public data
  const {
    data,
    loading,
    error,
    fetchMore,
    refetch: refetchPublic,
    client,
  } = usePublicQuery<LatestResponsesPublic>(LATEST_RESPONSES_PUBLIC, {
    variables: {
      mediaHash,
      first: RESPONSES_COUNT,
      articleOnly: articleOnlyMode,
    },
    notifyOnNetworkStatusChange: true,
  })

  // pagination
  const connectionPath = 'article.responses'
  const article = data?.article
  const { edges, pageInfo } = (article && article.responses) || {}
  const articleId = article && article.id
  const responses = filterResponses<ResponsePublic>(
    (edges || []).map(({ node }) => node)
  )

  // private data
  const loadPrivate = (publicData?: LatestResponsesPublic) => {
    if (!viewer.isAuthed || !publicData || !articleId) {
      return
    }

    const publiceEdges = publicData.article?.responses.edges || []
    const publicResponses = filterResponses<Response>(
      publiceEdges.map(({ node }) => node)
    )
    const publicIds = publicResponses
      .filter((node) => node.__typename === 'Comment')
      .map((node) => node.id)

    client.query({
      query: LATEST_RESPONSES_PRIVATE,
      fetchPolicy: 'network-only',
      variables: { ids: publicIds },
    })
  }

  // fetch private data for first page
  useEffect(() => {
    loadPrivate(data)
  }, [articleId, viewer.id])

  // load next page
  const loadMore = async (params?: { before: string }) => {
    const loadBefore = (params && params.before) || null
    const noLimit = loadBefore && pageInfo && pageInfo.endCursor

    const { data: newData } = await fetchMore({
      variables: {
        after: pageInfo && pageInfo.endCursor,
        before: loadBefore,
        first: noLimit ? null : RESPONSES_COUNT,
        includeBefore: !!loadBefore,
        articleOnly: articleOnlyMode,
      },
      updateQuery: (previousResult, { fetchMoreResult }) =>
        mergeConnections({
          oldData: previousResult,
          newData: fetchMoreResult,
          path: connectionPath,
        }),
    })

    loadPrivate(newData)
  }

  // refetch & pull to refresh
  const refetch = async () => {
    const { data: newData } = await refetchPublic()
    loadPrivate(newData)
  }
  useEventListener(REFETCH_RESPONSES, refetch)
  usePullToRefresh.Handler(refetch)

  useEffect(() => {
    if (pageInfo && pageInfo.startCursor) {
      setStoredCursor(pageInfo.startCursor)
    }
  }, [pageInfo && pageInfo.startCursor])

  const commentCallback = async () => {
    const { data: newData } = await fetchMore({
      variables: {
        before: storedCursor,
        includeBefore: false,
        articleOnly: articleOnlyMode,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newEdges = _get(fetchMoreResult, `${connectionPath}.edges`, [])
        const newResponseCount = _get(fetchMoreResult, 'article.responseCount')
        const oldResponseCount = _get(previousResult, 'article.responseCount')

        // update if response count has changed
        if (newEdges.length === 0) {
          if (oldResponseCount !== newResponseCount) {
            return {
              ...previousResult,
              article: {
                ...previousResult.article,
                responseCount: newResponseCount,
              },
            }
          }
          return previousResult
        }

        // update if there are new items in responses.edges
        const newResult = unshiftConnections({
          oldData: previousResult,
          newData: fetchMoreResult,
          path: connectionPath,
        })
        const newStartCursor = _get(
          newResult,
          `${connectionPath}.pageInfo.startCursor`,
          null
        )
        if (newStartCursor) {
          setStoredCursor(newStartCursor)
        }
        return newResult
      },
    })

    loadPrivate(newData)
  }

  // scroll to comment
  useEffect(() => {
    if (!fragment || !articleId) {
      return
    }

    const jumpToFragment = () => {
      jump(`#${fragment}`, {
        offset: fragment === UrlFragments.COMMENTS ? -10 : -64,
      })
    }
    const element = dom.$(`#${fragment}`)

    if (!element) {
      loadMore({ before: parentId }).then(jumpToFragment)
    } else {
      jumpToFragment()
    }
  }, [articleId])

  /**
   * Render
   */
  if (loading && !data) {
    return <Spinner />
  }

  if (error) {
    return <QueryError error={error} />
  }

  return (
    <section className="latest-responses" id="latest-responses">
      <header>
        <Title type="feed" is="h3">
          <Translate id="latestResponses" />
        </Title>

        <div className="latest-responses-switch">
          <Switch
            onChange={() => setArticleOnlyMode(!articleOnlyMode)}
            checked={articleOnlyMode}
            loading={loading}
          />
          <span>
            <Translate id="collectedOnly" />
          </span>
        </div>
      </header>

      {!responses ||
        (responses.length <= 0 && (
          <EmptyResponse articleOnlyMode={articleOnlyMode} />
        ))}

      <List spacing={['xloose', 0]}>
        {responses.map((response) => (
          <List.Item key={response.id}>
            {response.__typename === 'Article' ? (
              <ResponseArticle article={response} hasCover={isMediumUp} />
            ) : (
              <ResponseComment
                comment={response}
                defaultExpand={response.id === parentId && !!descendantId}
                hasLink
                commentCallback={commentCallback}
              />
            )}
          </List.Item>
        ))}
      </List>

      {pageInfo && pageInfo.hasNextPage && (
        <ViewMoreButton onClick={loadMore} loading={loading} />
      )}

      <style jsx>{styles}</style>
    </section>
  )
}

export default LatestResponses
