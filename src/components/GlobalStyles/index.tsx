import defaultsStyles from '~/common/styles/bases/defaults.css'
import resetStyles from '~/common/styles/bases/reset.css'
import gridsStyles from '~/common/styles/layouts/grids.css'
import displayStyles from '~/common/styles/utils/display.css'
import interactionStyles from '~/common/styles/utils/interaction.css'
import linkStyles from '~/common/styles/utils/link.css'
import motionStyles from '~/common/styles/utils/motion.css'
import tippyStyles from '~/common/styles/vendors/tippy.css'

export const GlobalStyles = () => (
  <>
    <style jsx global>
      {resetStyles}
    </style>
    <style jsx global>
      {defaultsStyles}
    </style>

    {/* layout */}
    <style jsx global>
      {gridsStyles}
    </style>

    {/* utils */}
    <style jsx global>
      {linkStyles}
    </style>
    <style jsx global>
      {motionStyles}
    </style>
    <style jsx global>
      {displayStyles}
    </style>
    <style jsx global>
      {interactionStyles}
    </style>

    {/* vendors */}
    <style jsx global>
      {tippyStyles}
    </style>
  </>
)