import { useEffect, useState } from 'react'
import { AppProvider, type ThemeName } from '@channel.io/bezier-react'

import { isMobile } from './utils/userAgent'
import { getWamData } from './utils/wam'
import Send from './pages/Send'
import SaveInfoWam from './pages/SaveProfile'

function Help() {
  return <div>헬프</div>
}

function App() {
  const [theme, setTheme] = useState<ThemeName>('light')

  useEffect(() => {
    const appearance = getWamData('appearance')
    setTheme(appearance === 'dark' ? 'dark' : 'light')
  }, [])

  // pageName 통해서 어떤 wam 띄울지 결정할 수 있게 하기
  const pageName = getWamData('pageName')

  return (
    <AppProvider themeName={theme}>
      <div style={{ padding: isMobile() ? '16px' : '0 24px 24px 24px' }}>
        {pageName === 'save' ? <Send /> : <Help/>}
        {pageName === 'saveProfile' ? <SaveInfoWam/> : <Help/>}
      </div>
    </AppProvider>
  )
}

export default App
