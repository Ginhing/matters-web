import gql from 'graphql-tag'
import _get from 'lodash/get'
import { createContext, useContext, useState } from 'react'
import { Mutation } from 'react-apollo'

import { ViewerContext } from '~/components/Viewer'

import { DEFAULT_LANG } from '~/common/enums'

const UPDATE_VIEWER_LANGUAGE = gql`
  mutation UpdateViewerLanguage($language: UserLanguage!) {
    updateUserInfo(input: { language: $language }) {
      id
      settings {
        language
      }
    }
  }
`

export const LanguageContext = createContext({} as {
  lang: Language
  setLang: (lang: Language) => void
})

export const LanguageConsumer = LanguageContext.Consumer

export const LanguageProvider = ({
  children,
  defaultLang = DEFAULT_LANG
}: {
  children: React.ReactNode
  defaultLang?: Language
}) => {
  const viewer = useContext(ViewerContext)
  const isAuthed = !!viewer.id
  const viewerLanguage = _get(viewer, 'settings.language')
  const [lang, setLang] = useState<Language>(viewerLanguage || defaultLang)

  return (
    <Mutation mutation={UPDATE_VIEWER_LANGUAGE}>
      {updateLanguage => (
        <LanguageContext.Provider
          value={{
            lang: viewerLanguage || lang,
            setLang: targetLang => {
              if (isAuthed) {
                try {
                  updateLanguage({ variables: { language: targetLang } })
                } catch (e) {
                  //
                }
              }

              setLang(targetLang)
            }
          }}
        >
          {children}
        </LanguageContext.Provider>
      )}
    </Mutation>
  )
}
