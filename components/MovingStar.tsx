'use client'

import { useState, useEffect } from 'react'

export default function MovingStar({ index }: { index: number }) {
  const [position, setPosition] = useState({ x: Math.random() * 100, y: Math.random() * 100 })

  useEffect(() => {
    const moveToNewPosition = () => {
      const newX = Math.random() * 100
      const newY = Math.random() * 100
      setPosition({ x: newX, y: newY })
    }

    const interval = setInterval(moveToNewPosition, Math.random() * 5000 + 5000)
    return () => clearInterval(interval)
  }, [])

  const size = index % 5 === 0 ? Math.random() * 4 + 3 : Math.random() * 3 + 1

  return (
    <div
      className="absolute rounded-full bg-yellow-200"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transition: 'all 5s linear',
      }}
    ></div>
  )
}