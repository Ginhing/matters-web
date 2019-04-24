import { Head, UserProfile } from '~/components'
import { Protected } from '~/components/Protected'

import UserTabs from '../UserTabs'
import MeHistory from './MeHistory'

export default () => (
  <Protected>
    <main>
      <Head title={{ zh_hant: '瀏覽記錄', zh_hans: '浏览记录' }} />

      <UserProfile />

      <section className="l-row">
        <div className="l-col-4 l-col-md-1 l-col-lg-2">
          <UserTabs />
        </div>
        <div className="l-col-4 l-col-md-6 l-col-lg-8">
          <MeHistory />
        </div>
      </section>
    </main>
  </Protected>
)