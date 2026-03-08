import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"

/** Return the nav item name whose URL best matches the current pathname. */
function getActiveFromPath(pathname, items) {
  // Exact match first
  const exact = items.find(item => item.url && item.url === pathname)
  if (exact) return exact.name
  // Prefix match (longest wins), excluding '/' to avoid it matching everything
  const prefix = items
    .filter(item => item.url && item.url !== '/' && pathname.startsWith(item.url))
    .sort((a, b) => b.url.length - a.url.length)[0]
  if (prefix) return prefix.name
  // Fall back to the first item with url '/' if on root
  if (pathname === '/') {
    const home = items.find(item => item.url === '/')
    if (home) return home.name
  }
  return items[0]?.name
}

export function NavBar({ items, className }) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => getActiveFromPath(location.pathname, items))

  // Keep active tab in sync with the URL whenever it changes (back/forward, programmatic nav, etc.)
  useEffect(() => {
    setActiveTab(getActiveFromPath(location.pathname, items))
  }, [location.pathname, items])

  useEffect(() => {
    const handleResize = () => {}
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-white/20 border border-white/30 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          const buttonContent = (
            <>
              <span className="hidden md:inline" style={{ pointerEvents: 'none' }}>{item.name}</span>
              <span className="md:hidden" style={{ pointerEvents: 'none' }}>
                <Icon size={18} strokeWidth={2.5} style={{ pointerEvents: 'none' }} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-blue-500/10 rounded-full -z-10"
                  style={{ pointerEvents: 'none' }}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full" style={{ pointerEvents: 'none' }}>
                    <div className="absolute w-12 h-6 bg-blue-600/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-blue-600/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-blue-600/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </>
          );

          const commonClasses = cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
            "text-slate-800 hover:text-blue-600",
            "inline-flex items-center justify-center select-none",
            isActive && "bg-slate-100/50 text-blue-700",
          );

          if (item.action) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  item.action();
                }}
                className={commonClasses}
                type="button"
              >
                {buttonContent}
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              to={item.url}
              className={commonClasses}
            >
              {buttonContent}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
