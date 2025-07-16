import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import "./PopOver.css"

interface PopoverProps {
  children: React.ReactNode
  content: React.ReactNode
  trigger?: "click" | "hover"
  placement?: "top" | "bottom" | "left" | "right"
  offset?: number
  className?: string
  contentClassName?: string
  disabled?: boolean
  closeOnClickOutside?: boolean
}

interface Position {
  top: number
  left: number
  placement: string
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  trigger = "click",
  placement = "bottom",
  offset = 8,
  className = "",
  contentClassName = "",
  disabled = false,
  closeOnClickOutside = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, placement })
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const contentRect = contentRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    let top = 0
    let left = 0
    let finalPlacement = placement

    // Calculate position based on placement
    switch (placement) {
      case "top":
        top = triggerRect.top - contentRect.height - offset
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        break
      case "bottom":
        top = triggerRect.bottom + offset
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        left = triggerRect.left - contentRect.width - offset
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        left = triggerRect.right + offset
        break
    }

    // Adjust for viewport boundaries
    if (left < 0) {
      left = 8
    } else if (left + contentRect.width > viewport.width) {
      left = viewport.width - contentRect.width - 8
    }

    if (top < 0) {
      if (placement === "top") {
        top = triggerRect.bottom + offset
        finalPlacement = "bottom"
      } else {
        top = 8
      }
    } else if (top + contentRect.height > viewport.height) {
      if (placement === "bottom") {
        top = triggerRect.top - contentRect.height - offset
        finalPlacement = "top"
      } else {
        top = viewport.height - contentRect.height - 8
      }
    }

    setPosition({ top, left, placement: finalPlacement })
  }, [placement, offset])

  const handleOpen = () => {
    if (disabled) return
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      clearTimeout(timeoutRef.current as NodeJS.Timeout)
      handleOpen()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      timeoutRef.current = setTimeout(handleClose, 100)
    }
  }

  const handleClick = () => {
    if (trigger === "click") {
      if (isOpen) {
        handleClose()
      } else {
        handleOpen()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      handleClose()
    }
  }

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, closeOnClickOutside])

  // Calculate position when opened
  useEffect(() => {
    if (isOpen) {
      calculatePosition()
      window.addEventListener("resize", calculatePosition)
      window.addEventListener("scroll", calculatePosition)
      return () => {
        window.removeEventListener("resize", calculatePosition)
        window.removeEventListener("scroll", calculatePosition)
      }
    }
  }, [isOpen, calculatePosition])

  return (
    <>
      <div
        ref={triggerRef}
        className={`popover-trigger ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={contentRef}
          className={`popover-content ${contentClassName}`}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 1000,
          }}
          data-placement={position.placement}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="tooltip"
          aria-hidden={!isOpen}
        >
          <div className="popover-body">{content}</div>
        </div>
      )}
    </>
  )
}
