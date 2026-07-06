import { useState, useEffect, useCallback } from 'react'

const getState = () => ({
  isMobile:  window.innerWidth < 640,
  isTablet:  window.innerWidth >= 640 && window.innerWidth < 1024,
  isDesktop: window.innerWidth >= 1024,
  width:     window.innerWidth,
})

const useBreakpoint = () => {
  const [bp, setBp] = useState(getState)
  const handler = useCallback(() => setBp(getState()), [])
  useEffect(() => {
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [handler])
  return bp
}

export default useBreakpoint
