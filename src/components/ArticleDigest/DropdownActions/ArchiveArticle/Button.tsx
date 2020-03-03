import { Icon, Menu, TextIcon, Translate } from '~/components'

const ArchiveArticleButton = ({ openDialog }: { openDialog: () => void }) => {
  return (
    <Menu.Item onClick={openDialog}>
      <TextIcon
        icon={<Icon.ArchiveMedium size="md" />}
        size="md"
        spacing="base"
      >
        <Translate zh_hant="站內隱藏" zh_hans="站内隐藏" />
      </TextIcon>
    </Menu.Item>
  )
}

export default ArchiveArticleButton