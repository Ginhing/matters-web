import { useState } from 'react'

import { Dialog, Translate } from '~/components'
import LoginForm from '~/components/Form/LoginForm'

import { TEXT } from '~/common/enums'

interface LoginDialogProps {
  children: ({ open }: { open: () => void }) => React.ReactNode
}

const LoginDialog = ({ children }: LoginDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const open = () => setShowDialog(true)
  const close = () => setShowDialog(false)

  return (
    <>
      {children({ open })}

      <Dialog
        title={
          <Translate
            zh_hant={TEXT.zh_hant.login}
            zh_hans={TEXT.zh_hans.login}
          />
        }
        size="sm"
        isOpen={showDialog}
        onDismiss={close}
      >
        <LoginForm purpose="dialog" submitCallback={close} />
      </Dialog>
    </>
  )
}

export default LoginDialog
