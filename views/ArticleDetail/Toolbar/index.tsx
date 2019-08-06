import classNames from 'classnames'
import gql from 'graphql-tag'
import _get from 'lodash/get'

import { BookmarkButton } from '~/components/Button/Bookmark'
import ShareButton from '~/components/ShareButton'

import { ToolbarArticle } from './__generated__/ToolbarArticle'
import Appreciators from './Appreciators'
import CollectedByButton from './CollectedByButton'
import ExtendButton from './ExtendButton'
import MATButton from './MATButton'
import MoreButton from './MoreButton'
import ResponseButton from './ResponseButton'
import styles from './styles.css'

const fragments = {
  article: gql`
    fragment ToolbarArticle on Article {
      id
      ...MATArticleDetail
      ...AppreciatorsArticle
      ...BookmarkArticle
      ...ResponseButtonArticle
      ...MoreButtonArticle
      ...CollectedByArticle
      ...ExtendButtonArticle
    }
    ${MATButton.fragments.article}
    ${Appreciators.fragments.article}
    ${BookmarkButton.fragments.article}
    ${ResponseButton.fragments.article}
    ${MoreButton.fragments.article}
    ${CollectedByButton.fragments.article}
    ${ExtendButton.fragments.article}
  `
}

const Toolbar = ({
  article,
  placement,
  fixed
}: {
  article: ToolbarArticle
  placement: 'bottom' | 'left'
  fixed?: boolean
}) => {
  if (placement === 'left') {
    return (
      <section className="toolbar-left">
        <div className="container">
          <MATButton article={article} />
          <ResponseButton article={article} textPlacement="bottom" />
          <BookmarkButton article={article} size="default" />
          <ShareButton />
        </div>
        <style jsx>{styles}</style>
      </section>
    )
  }

  const bottomToolbarClass = classNames({
    'toolbar-bottom': true,
    fixed
  })

  return (
    <section className={bottomToolbarClass}>
      <section className="left">
        <MATButton article={article} />
        <Appreciators article={article} />
      </section>
      <section className="right">
        <ResponseButton article={article} />
        <ExtendButton article={article} />
        <BookmarkButton article={article} size="default" />
        <ShareButton />
        <MoreButton article={article} />
      </section>
      <style jsx>{styles}</style>
    </section>
  )
}

Toolbar.fragments = fragments

export default Toolbar
