import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { BookmarkButton, ShareButton } from '~/components'
import DropdownActions from '~/components/ArticleDigest/DropdownActions'

import AppreciationButton from '../AppreciationButton'
import CommentBar from './CommentBar'
import styles from './styles.css'

import { ArticleToolbar } from './__generated__/ArticleToolbar'

const ARTICLE_TOOLBAR = gql`
  query ArticleToolbar($mediaHash: String) {
    article(input: { mediaHash: $mediaHash }) {
      id
      ...AppreciationButtonArticle
      ...CommentBarArticle
      ...BookmarkArticle
      ...DropdownActionsArticle
    }
  }
  ${AppreciationButton.fragments.article}
  ${CommentBar.fragments.article}
  ${BookmarkButton.fragments.article}
  ${DropdownActions.fragments.article}
`

const Toolbar = ({ mediaHash }: { mediaHash: string }) => {
  const { data, loading } = useQuery<ArticleToolbar>(ARTICLE_TOOLBAR, {
    variables: { mediaHash }
  })

  if (loading || !data || !data.article) {
    return null
  }

  const { article } = data

  return (
    <section className="toolbar">
      <section className="appreciate-button">
        <AppreciationButton article={article} />
      </section>

      <section className="comment-bar">
        <CommentBar article={article} />
      </section>

      <section className="buttons">
        <BookmarkButton article={article} size="md-s" inCard={false} />
        <ShareButton iconSize="md-s" inCard={false} />
        <DropdownActions
          article={article}
          color="black"
          size="md-s"
          inCard={false}
        />
      </section>

      <style jsx>{styles}</style>
    </section>
  )
}

export default Toolbar
