import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import config from '../config/config'

const RedirectHandler = () => {
  const location = useLocation()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkRedirect = async () => {
      // Don't check admin or super admin routes
      if (location.pathname.startsWith('/admin') || 
          location.pathname.startsWith('/grabiansadmin') ||
          location.pathname.startsWith('/superadmin') ||
          location.pathname.startsWith('/grabiansuperadmin')) {
        setChecked(true)
        return
      }

      try {
        const currentPath = location.pathname
        console.log('🔍 Checking redirect for path:', currentPath)
        
        // Fetch active redirects from backend
        const response = await axios.get(`${config.API_URL}/api/redirects/check`, {
          params: { path: currentPath }
        })

        if (response.data && response.data.found && response.data.redirectTo) {
          const { redirectTo, redirectType } = response.data
          console.log('✅ Redirect found! Redirecting to:', redirectTo)
          
          // Check if redirectTo is external URL
          if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
            // External redirect - use window.location.replace for permanent redirects
            if (redirectType === '301' || redirectType === '308') {
              window.location.replace(redirectTo)
            } else {
              window.location.href = redirectTo
            }
          } else {
            // Internal redirect
            if (redirectType === '301' || redirectType === '308') {
              window.location.replace(redirectTo)
            } else {
              window.location.href = redirectTo
            }
          }
        } else {
          setChecked(true)
        }
      } catch (error) {
        // No redirect found - allow page to load normally
        console.debug('❌ No redirect found for:', location.pathname)
        setChecked(true)
      }
    }

    checkRedirect()
  }, [location.pathname])

  return null
}

export default RedirectHandler
