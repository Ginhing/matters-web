import gql from 'graphql-tag'

import { BookmarkButton } from '~/components/Buttons/Bookmark'
import { ShareButton } from '~/components/Buttons/Share'

import { toPath } from '~/common/utils'

import DropdownActions, { DropdownActionsControls } from '../DropdownActions'
import Appreciation from './Appreciation'
import ResponseCount from './ResponseCount'
import styles from './styles.css'

import { FooterActionsArticlePublic } from './__generated__/FooterActionsArticlePublic'

export type FooterActionsControls = DropdownActionsControls

type FooterActionsProps = {
  article: FooterActionsArticlePublic
} & FooterActionsControls

const fragments = {
  article: {
    public: gql`
      fragment FooterActionsArticlePublic on Article {
        id
        title
        slug
        mediaHash
        author {
          id
          userName
        }
        ...AppreciationArticle
        ...ActionsResponseCountArticle
        ...DropdownActionsArticle
      }
      ${Appreciation.fragments.article}
      ${ResponseCount.fragments.article}
      ${DropdownActions.fragments.article}
    `,
    private: gql`
      fragment FooterActionsArticlePrivate on Article {
        ...BookmarkArticlePrivate
      }
      ${BookmarkButton.fragments.article.private}
    `,
  },
}

const FooterActions = ({
  article,
  inCard = false,
  ...controls
}: FooterActionsProps) => {
  const { title } = article
  const path = toPath({
    page: 'articleDetail',
    article,
  })

  return (
    <footer
      aria-label={`${article.appreciationsReceivedTotal} 個讚賞、${article.responseCount} 條回應`}
    >
      <section className="left">
        <Appreciation article={article} size="sm" />
        <ResponseCount article={article} size="sm" inCard={inCard} />
      </section>

      <section className="right">
        <DropdownActions article={article} {...controls} inCard={inCard} />
        <BookmarkButton article={article} inCard={inCard} />
        <ShareButton
          title={title}
          path={encodeURI(path.as)}
          iconColor="grey"
          inCard={inCard}
        />
      </section>

      <style jsx>{styles}</style>
    </footer>
  )
}

FooterActions.fragments = fragments

export default FooterActions
