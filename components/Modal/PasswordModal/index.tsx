import { FC, useContext, useState } from 'react'

import {
  PasswordChangeConfirmForm,
  PasswordChangeRequestForm
} from '~/components/Form/PasswordChangeForm'
import { LanguageContext, Translate } from '~/components/Language'
import { Modal } from '~/components/Modal'
import ModalComplete from '~/components/Modal/Complete'
import { ViewerContext } from '~/components/Viewer'

import { translate } from '~/common/utils'

/**
 * This component is for password reset modal.
 *
 * Usage:
 *
 * ```jsx
 *   <PasswordModal purpose={'forget'} close={close} />
 * ```
 *
 */

const PasswordModal: FC<
  ModalInstanceProps & { purpose: 'forget' | 'change' }
> = ({ purpose }) => {
  const { lang } = useContext(LanguageContext)
  const viewer = useContext(ViewerContext)

  const [step, setStep] = useState('request')

  const [data, setData] = useState<{ [key: string]: any }>({
    request: {
      title:
        purpose === 'forget'
          ? translate({ zh_hant: '忘記密碼', zh_hans: '忘记密码', lang })
          : translate({ zh_hant: '修改密碼', zh_hans: '修改密码', lang }),
      prev: 'login',
      next: 'reset',
      email: viewer.info.email
    },
    reset: {
      title:
        purpose === 'forget'
          ? translate({ zh_hant: '重置密碼', zh_hans: '重置密码', lang })
          : translate({ zh_hant: '修改密碼', zh_hans: '修改密码', lang }),
      prev: 'request',
      next: 'complete'
    },
    complete: {
      title:
        purpose === 'forget'
          ? translate({
              zh_hant: '密碼重置成功',
              zh_hans: '密码重置成功',
              lang
            })
          : translate({
              zh_hant: '密碼修改成功',
              zh_hans: '密码修改成功',
              lang
            })
    }
  })

  const requestCodeCallback = (params: any) => {
    const { email, codeId } = params
    setData(prev => {
      return {
        ...prev,
        request: {
          ...prev.request,
          email,
          codeId
        }
      }
    })
    setStep('reset')
  }

  const backPreviousStep = (event: any) => {
    event.stopPropagation()
    setStep('request')
  }

  return (
    <>
      <Modal.Header title={data[step].title} />

      <Modal.Content>
        {step === 'request' && (
          <PasswordChangeRequestForm
            defaultEmail={data.request.email}
            purpose={purpose}
            container="modal"
            submitCallback={requestCodeCallback}
          />
        )}
        {step === 'reset' && (
          <PasswordChangeConfirmForm
            codeId={data.request.codeId}
            container="modal"
            backPreviousStep={backPreviousStep}
            submitCallback={() => setStep('complete')}
          />
        )}
        {step === 'complete' && (
          <ModalComplete
            message={
              purpose === 'forget' ? (
                <Translate zh_hant="密碼重置成功" zh_hans="密码重置成功" />
              ) : (
                <Translate zh_hant="密碼修改成功" zh_hans="密码修改成功" />
              )
            }
            hint={
              purpose === 'forget' ? (
                <Translate
                  zh_hant="請使用新的密碼重新登入"
                  zh_hans="请使用新的密码重新登入"
                />
              ) : (
                ''
              )
            }
          />
        )}
      </Modal.Content>
    </>
  )
}

export default PasswordModal
