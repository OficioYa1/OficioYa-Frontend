import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig as FramerMotionConfig } from 'framer-motion'
import { MotionConfig } from 'motion/react'
import { Globals } from '@react-spring/web'
import './styles/tokens.css'
import './index.css'
import './styles/sticker.css'
import './styles/glass.css'
import './styles/motion.css'
import App from './App.tsx'

// Movimiento reducido (OFY-NF-07): el CSS ya lo respeta en index.css; esto
// cubre las animaciones por JavaScript. framer-motion y motion viven en dos
// paquetes distintos, así que cada uno necesita su propio MotionConfig.
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const syncSpringMotion = () => Globals.assign({ skipAnimation: reduceMotionQuery.matches })
syncSpringMotion()
reduceMotionQuery.addEventListener('change', syncSpringMotion)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <FramerMotionConfig reducedMotion="user">
        <App />
      </FramerMotionConfig>
    </MotionConfig>
  </StrictMode>,
)
