import gql from 'graphql-tag'
import _get from 'lodash/get'

import commentFragments from '~/components/GQL/fragments/comment'
import { Label } from '~/components/Label'
import { Translate } from '~/components/Language'
import { UserDigest } from '~/components/UserDigest'

import contentCommentStyles from '~/common/styles/utils/content.comment.css'

import Actions, { CommentActionsControls } from '../Actions'
import { FeedDigestComment } from './__generated__/FeedDigestComment'
import styles from './styles.css'

const fragments = {
  comment: gql`
    fragment FeedDigestComment on Comment {
      ...BaseDigestComment
      comments(input: { sort: oldest, first: 100 })
        @include(if: $hasDescendantComments) {
        edges {
          cursor
          node {
            ...BaseDigestComment
          }
        }
      }
    }
    ${commentFragments.base}
  `
}

const ReplyTo = ({ user }: any) => (
  <>
    <span className="reply-to">
      <Translate zh_hant="回復" zh_hans="回复" />
    </span>
    <UserDigest.Mini
      user={user}
      avatarSize="xxxsmall"
      textWeight="medium"
      spacing="xxtight"
    />
    <style jsx>{styles}</style>
  </>
)

const PinnedLabel = () => (
  <span className="label">
    <Label size="small">
      <Translate zh_hant="作者推薦" zh_hans="作者推荐" />
    </Label>
    <style jsx>{styles}</style>
  </span>
)

const BannedContent = () => (
  <p className="banned-content">
    <Translate
      zh_hant="此評論因違反用戶協定而被隱藏"
      zh_hans="此评论因违反用户协定而被隐藏"
    />
    <style jsx>{styles}</style>
  </p>
)

const FeedDigest = ({
  comment,
  ...actionControls
}: { comment: FeedDigestComment } & CommentActionsControls) => {
  const { state, content, author, replyTo, parentComment, pinned } = comment
  const descendantComments = _get(comment, 'comments.edges', [])
  console.log(state)
  return (
    <section className="container">
      <header className="header">
        <div className="avatars">
          <UserDigest.Mini
            user={author}
            avatarSize="small"
            textWeight="medium"
          />
          {replyTo && (!parentComment || replyTo.id !== parentComment.id) && (
            <ReplyTo user={replyTo.author} />
          )}
          {pinned && <PinnedLabel />}
        </div>
      </header>

      <div className="content-wrap">
        {state === 'active' ? (
          <div
            className="content-comment"
            dangerouslySetInnerHTML={{
              __html: content || ''
            }}
          />
        ) : (
          <BannedContent />
        )}
        <Actions comment={comment} {...actionControls} />

        {descendantComments.length > 0 && (
          <ul className="descendant-comments">
            {descendantComments.map(
              ({ node, cursor }: { node: any; cursor: any }) => (
                <li key={cursor}>
                  <section className="container">
                    <header className="header">
                      <div className="avatars">
                        <UserDigest.Mini
                          user={node.author}
                          avatarSize="xsmall"
                          textWeight="medium"
                        />
                        {node.replyTo &&
                          (!node.parentComment ||
                            node.replyTo.id !== node.parentComment.id) && (
                            <ReplyTo user={node.replyTo.author} />
                          )}
                        {node.pinned && <PinnedLabel />}
                      </div>
                    </header>

                    <div className="content-wrap">
                      <div
                        className="content-comment"
                        dangerouslySetInnerHTML={{
                          __html: node.content || ''
                        }}
                      />
                      <Actions comment={node} {...actionControls} />
                    </div>
                  </section>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      <style jsx>{styles}</style>
      <style jsx>{contentCommentStyles}</style>
    </section>
  )
}

FeedDigest.fragments = fragments

export default FeedDigest
