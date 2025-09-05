"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
    children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        const handleMouseEnter = () => setIsActive(true)
        const handleMouseLeave = () => setIsActive(false)

        const container = containerRef.current
        if (container) {
            container.addEventListener("mouseenter", handleMouseEnter)
            container.addEventListener("mouseleave", handleMouseLeave)
        }

        return () => {
            if (container) {
                container.removeEventListener("mouseenter", handleMouseEnter)
                container.removeEventListener("mouseleave", handleMouseLeave)
            }
        }
    }, [])

    return (
        <div ref={containerRef} className="h-[24rem] bg-black relative overflow-hidden group">
            {/* SVG Filters for enhanced visual effects */}
            <svg className="absolute inset-0 w-0 h-0">
                <defs>
                    <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
                        <feTurbulence baseFrequency="0.002" numOctaves="2" result="noise" seed="1" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                        <feGaussianBlur stdDeviation="0.5" />
                        <feColorMatrix
                            type="matrix"
                            values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.95 0"
                        />
                    </filter>
                    <filter id="glow-filter">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* Background Shaders with enhanced animation */}
            <MeshGradient
                className="absolute inset-0 w-full h-full transition-all duration-1000 group-hover:scale-105"
                colors={["#000000", "#0a0a0a", "#ffffff", "#141414", "#000000"]}
                speed={1.5}
            />
            <MeshGradient
                className="absolute inset-0 w-full h-full opacity-25 mix-blend-screen transition-opacity duration-700 group-hover:opacity-40"
                colors={["#ffffff", "#e8e8e8", "#000000", "#f5f5f5"]}
                speed={2.0}
                wireframe="true"
            />
            <MeshGradient
                className="absolute inset-0 w-full h-full opacity-15 mix-blend-overlay"
                colors={["#000000", "#707070", "#ffffff"]}
                speed={0.8}
            />
            
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />

            {children}
        </div>
    )
}
