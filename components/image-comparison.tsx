"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface ImageComparisonProps {
  locale?: string
}

export default function ImageComparison({ locale }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations("demo")

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }, [updateSliderPosition])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.touches[0].clientX)
  }, [updateSliderPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updateSliderPosition(e.clientX)
  }, [isDragging, updateSliderPosition])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updateSliderPosition(e.touches[0].clientX)
  }, [isDragging, updateSliderPosition])

  // 添加全局事件监听器以支持在容器外拖动
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
      
      // 添加用户选择禁用以防止拖动时选中文本
      document.body.style.userSelect = 'none'
      ;(document.body.style as any).webkitUserSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
      
      // 恢复用户选择
      document.body.style.userSelect = ''
      ;(document.body.style as any).webkitUserSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  // 处理容器点击
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      updateSliderPosition(e.clientX)
    }
  }, [updateSliderPosition])

  // 图片加载完成后设置状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        className={`relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl cursor-col-resize transition-opacity duration-300 select-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleContainerClick}
        style={{ touchAction: 'none' }}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <Image
            src="/Original.jpg"
            alt="Original cityscape during daytime"
            fill
            className="object-cover pointer-events-none"
            priority
            onLoad={() => setIsLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
            Original
          </div>
        </div>

        {/* After Image */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none" 
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src="/AI Enhanced.jpg"
            alt="AI-transformed cyberpunk cityscape at night"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            AI Enhanced
          </div>
        </div>

        {/* Slider */}
        <div
          className={`absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize ${
            isDragging ? 'scale-x-150' : 'transition-transform duration-150 ease-out'
          }`}
          style={{ 
            left: `${sliderPosition}%`,
            zIndex: 10,
            willChange: 'left, transform'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-150 ${
            isDragging ? 'scale-125 shadow-xl' : 'hover:scale-110'
          }`}>
            <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5"></div>
            <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5"></div>
          </div>
        </div>

        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 text-sm text-muted-foreground transition-opacity duration-300">
        {t("sliderInstruction")}
      </div>
    </div>
  )
}
