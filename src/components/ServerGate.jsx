// "use client"

// import { useEffect, useState } from "react"
// import { checkServerHealth } from "../services/health"
// import Maintenance from "./Maintenance"

// export default function ServerGate({ children }) {
//   const [status, setStatus] = useState("checking") // 'checking' | 'up' | 'down'

//   useEffect(() => {
//     let mounted = true

//     const probe = async () => {
//       try {
//         const ok = await checkServerHealth()
//         if (!mounted) return
//         setStatus(ok ? "up" : "down")
//       } catch {
//         if (mounted) setStatus("down")
//       }
//     }

//     probe()
//     const id = setInterval(probe, 30000) // recheck every 30s
//     return () => {
//       mounted = false
//       clearInterval(id)
//     }
//   }, [])

//   if (status === "checking") {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <div className="flex items-center gap-3 text-gray-600">
//           <span className="h-3 w-3 rounded-full bg-gray-300 animate-pulse" />
//           <span className="h-3 w-3 rounded-full bg-gray-300 animate-pulse [animation-delay:150ms]" />
//           <span className="h-3 w-3 rounded-full bg-gray-300 animate-pulse [animation-delay:300ms]" />
//           <span className="sr-only">Checking server status…</span>
//         </div>
//       </div>
//     )
//   }

//   if (status === "down") {
//     return <Maintenance />
//   }

//   return children
// }
