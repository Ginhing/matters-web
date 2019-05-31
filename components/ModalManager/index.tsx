import React, { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import { Modal, useEventListener } from '~/components'

import { OPEN_MODAL } from '~/common/enums'

const emptyModalId = ''

export const ModalContext = React.createContext({
  detail: {},
  prevModalId: emptyModalId,
  openedModalId: emptyModalId,
  open: (modalId: string) => {
    // Do nothing
  },
  close: () => {
    // Do nothing
  }
})

/**
 * Context provider for global modal management.
 *
 * Usage:
 *
 * ```jsx
 *   <ModalProvider defaultModalId={optional}>
 *     <App />
 *   </ModalProvider>
 * ```
 *
 */
export const ModalProvider = ({
  children,
  defaultModalId = emptyModalId
}: {
  children: ReactNode
  defaultModalId?: string
}) => {
  const [prevModalId, setPrevModalId] = useState(emptyModalId)
  const [openedModalId, setOpenedModalId] = useState(defaultModalId)
  const [detail, setDetail] = useState({})

  const open = (id: string) => {
    setPrevModalId(openedModalId)
    setOpenedModalId(id)
  }

  const close = () => {
    setPrevModalId(defaultModalId)
    setOpenedModalId(defaultModalId)
  }

  // listen for open modal event
  useEventListener(OPEN_MODAL, (eventDetail: CustomEvent['detail']) => {
    if (eventDetail.id) {
      open(eventDetail.id)
      setDetail(eventDetail)
    }
  })

  return (
    <ModalContext.Provider
      value={{
        detail,
        prevModalId,
        openedModalId,
        open: (modalId: string) => open(modalId),
        close: () => close()
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

/**
 * Context consumer for activating modal.
 *
 * Usage:
 *
 * ```jsx
 *   <ModalSwitch modalId="loginModal">
 *     {(open) => <Button onClick={open} />}
 *   </ModalSwitch>
 * ```
 *
 */
export const ModalSwitch = ({
  children,
  modalId,
  detail
}: {
  children: any
  modalId: string
  detail?: CustomEvent['detail']
}) => (
  <ModalContext.Consumer>
    {({ open }) => children(() => open(modalId))}
  </ModalContext.Consumer>
)

/**
 * Context consumer for hosting modal instance.
 *
 * Usage:
 *
 * ```jsx
 *  <ModalInstance modalId="loginModal" title="title">
 *    {({ close, interpret }) => <LoginModal />}
 *  </ModalInstance>
 * ```
 *
 */
const defaultAnchorNode = 'modal-anchor'

export const ModalInstance = ({
  children,
  defaultCloseable,
  modalId,
  title,
  layout
}: {
  children: any
  defaultCloseable?: boolean
  modalId: string
  title?: string
  layout?: 'default' | 'small'
}) => {
  const [node, setNode] = useState<Element | null>(null)

  useEffect(() => {
    if (document) {
      setNode(document.getElementById(defaultAnchorNode))
    }
  })

  return (
    <ModalContext.Consumer>
      {({ close, prevModalId, openedModalId, detail }) => {
        if (children && node && openedModalId === modalId) {
          return ReactDOM.createPortal(
            <Modal.Container
              title={title}
              close={close}
              defaultCloseable={defaultCloseable}
              prevModalId={prevModalId}
              layout={layout}
              detail={detail}
            >
              {(props: any) => children(props)}
            </Modal.Container>,
            node
          )
        }
        return null
      }}
    </ModalContext.Consumer>
  )
}
