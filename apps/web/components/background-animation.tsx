"use client"

import { useEffect, useRef } from "react"

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Matrix rain effect with enhanced visuals
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~"
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Array to track the y position of each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Array to store character colors
    const colors: string[] = []
    for (let i = 0; i < columns; i++) {
      colors[i] = `hsl(${140 + Math.random() * 40}, 100%, ${50 + Math.random() * 20}%)`
    }

    // Drawing the characters with enhanced effects
    const draw = () => {
      // Black with opacity to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length))

        // Dynamic color based on position
        const y = drops[i] * fontSize
        const normalizedY = y / canvas.height
        const alpha = Math.max(0.2, 1 - normalizedY)
        ctx.fillStyle = colors[i]
        ctx.globalAlpha = alpha
        ctx.font = `${fontSize}px monospace`

        // Add glow effect
        ctx.shadowBlur = 5
        ctx.shadowColor = colors[i]

        // Draw character
        ctx.fillText(text, i * fontSize, y)

        // Reset shadow properties
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        // Sending the drop back to the top randomly after it crosses the screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          // Refresh color
          colors[i] = `hsl(${140 + Math.random() * 40}, 100%, ${50 + Math.random() * 20}%)`
        }

        // Incrementing Y coordinate with varying speed
        drops[i] += 0.5 + Math.random() * 0.5
      }
    }

    const interval = setInterval(draw, 35)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30" />
}

