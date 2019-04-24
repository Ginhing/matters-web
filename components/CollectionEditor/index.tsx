import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import React from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from 'react-beautiful-dnd'

import { ArticleDigest } from '~/components/ArticleDigest'
import { DropdownDigestArticle } from '~/components/ArticleDigest/DropdownDigest/__generated__/DropdownDigestArticle'
import { Icon } from '~/components/Icon'

import ICON_DELETE_BLACK_CIRCLE from '~/static/icons/delete-black-circle.svg?sprite'
import ICON_DRAG from '~/static/icons/drag.svg?sprite'

import CollectForm from './CollectForm'
import styles from './styles.css'

interface State {
  articles: DropdownDigestArticle[]
  prevArticleIds: string[]
}

interface Props {
  articles: DropdownDigestArticle[]
  onEdit: (articleIds: string[]) => void
}

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

class CollectionEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      articles: this.props.articles,
      prevArticleIds: this.props.articles.map(({ id }) => id)
    }
  }

  componentDidUpdate() {
    const { prevArticleIds } = this.state
    const articleIds = this.props.articles.map(({ id }) => id)

    if (_isEqual(prevArticleIds, articleIds)) {
      return
    }

    this.setState({ articles: this.props.articles, prevArticleIds: articleIds })
  }

  onAdd = (articleId: string) => {
    const prevArticleIds = this.state.articles.map(({ id }) => id)
    this.props.onEdit([...prevArticleIds, articleId])
  }

  onDelete = (articleId: string) => {
    const prevArticleIds = this.state.articles.map(({ id }) => id)
    this.props.onEdit(prevArticleIds.filter(id => id !== articleId))
  }

  onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) {
      return
    }

    const newItems = reorder(
      this.state.articles,
      result.source.index,
      result.destination.index
    )
    this.setState({ articles: newItems })
    this.props.onEdit(newItems.map(({ id }) => id))
  }

  render() {
    const { articles } = this.state

    return (
      <>
        <CollectForm onAdd={this.onAdd} />

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable-1">
            {(dropProvided, dropSnapshot) => (
              <ul ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                {articles.map((article, index) => (
                  <Draggable
                    draggableId={article.id}
                    index={index}
                    key={article.id}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <li
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={classNames({
                          dragging: dragSnapshot.isDragging
                        })}
                      >
                        <span className="drag-handler" aria-label="拖拽">
                          <Icon
                            id={ICON_DRAG.id}
                            viewBox={ICON_DRAG.viewBox}
                            size="small"
                          />
                        </span>

                        <ArticleDigest.Dropdown
                          article={article}
                          hasArrow
                          disabled
                        />

                        <button
                          type="button"
                          className="delete-handler"
                          aria-label="刪除"
                          onClick={() => this.onDelete(article.id)}
                        >
                          <Icon
                            id={ICON_DELETE_BLACK_CIRCLE.id}
                            viewBox={ICON_DELETE_BLACK_CIRCLE.viewBox}
                            size="small"
                          />
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}

                {dropProvided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <style jsx>{styles}</style>
      </>
    )
  }
}

export default CollectionEditor