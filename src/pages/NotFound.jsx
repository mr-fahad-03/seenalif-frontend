


"use client"

import { useState, useEffect } from "react"

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Eyes center relative to viewport width
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const centerY = 200;
  const leftEyeCenter = { x: vw / 2 - 60, y: centerY };
  const rightEyeCenter = { x: vw / 2 + 60, y: centerY };

  const calculatePupilPosition = (eyeCenterX, eyeCenterY) => {
    const deltaX = mousePosition.x - eyeCenterX
    const deltaY = mousePosition.y - eyeCenterY
    const angle = Math.atan2(deltaY, deltaX)
    const distance = Math.min(25, Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 10)
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  }

  const leftPupil = calculatePupilPosition(leftEyeCenter.x, leftEyeCenter.y)
  const rightPupil = calculatePupilPosition(rightEyeCenter.x, rightEyeCenter.y)

  return (
    <div className="min-h-screen -mt-16 flex flex-col items-center justify-center bg-gray-100">
      {/* Eyes Row */}
      <div className="flex flex-row items-center justify-center mb-10" style={{ height: 140 }}>
        {/* Left Eye */}
        <div className="w-32 h-32 bg-white rounded-full relative shadow-lg mx-2 flex items-center justify-center">
          <div
            className="w-12 h-12 bg-lime-500 rounded-full absolute top-1/2 left-1/2 transition-transform duration-100 ease-out"
            style={{
              transform: `translate(calc(-50% + ${leftPupil.x}px), calc(-50% + ${leftPupil.y}px))`,
            }}
          />
        </div>
        {/* Right Eye */}
        <div className="w-32 h-32 bg-white rounded-full relative shadow-lg mx-2 flex items-center justify-center">
          <div
            className="w-12 h-12 bg-lime-500 rounded-full absolute top-1/2 left-1/2 transition-transform duration-100 ease-out"
            style={{
              transform: `translate(calc(-50% + ${rightPupil.x}px), calc(-50% + ${rightPupil.y}px))`,
            }}
          />
        </div>
      </div>

      {/* 404 Text */}
      <h1 className="text-6xl font-serif text-lime-500 mb-8 text-center" style={{ fontFamily: "Georgia, serif" }}>
        404, Page Not Found.
      </h1>

      {/* Home Button */}
      <button
        className="bg-lime-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
        onClick={() => (window.location.href = "/")}
      >
        Please Take Me Home
      </button>
    </div>
  )
}