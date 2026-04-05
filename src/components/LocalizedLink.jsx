"use client"

import { Link, useLocation } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

/**
 * LocalizedLink - A Link component that automatically adds language prefix to URLs
 * Use this instead of regular Link for internal navigation to maintain language context
 */
const LocalizedLink = ({ to, children, ...props }) => {
  const { getLocalizedPath } = useLanguage()
  const location = useLocation()

  // Don't localize external links or anchor links
  if (typeof to === 'string' && (to.startsWith('http') || to.startsWith('#') || to.startsWith('mailto:'))) {
    return <Link to={to} {...props}>{children}</Link>
  }

  // Don't localize admin routes
  if (typeof to === 'string' && (to.startsWith('/admin') || to.startsWith('/grabiansadmin'))) {
    return <Link to={to} {...props}>{children}</Link>
  }

  // Get the localized path
  const localizedTo = getLocalizedPath(to)

  return <Link to={localizedTo} {...props}>{children}</Link>
}

export default LocalizedLink
