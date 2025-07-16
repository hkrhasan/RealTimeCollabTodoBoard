import { useRef } from "react"
import { useTabsContext } from "."

type TabsListProps = {
  className?: string
  children: React.ReactNode
}

export const TabsList: React.FC<TabsListProps> = ({ className = "", children }) => {
  const { orientation } = useTabsContext()
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const triggers = listRef.current?.querySelectorAll('[role="tab"]:not([disabled])')
    if (!triggers) return

    const currentIndex = Array.from(triggers).findIndex((trigger) => trigger === event.target)

    let nextIndex = currentIndex

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1
        break
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault()
        nextIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0
        break
      case "Home":
        event.preventDefault()
        nextIndex = 0
        break
      case "End":
        event.preventDefault()
        nextIndex = triggers.length - 1
        break
      default:
        return
    }

    const nextTrigger = triggers[nextIndex] as HTMLElement
    nextTrigger.focus()
    nextTrigger.click()
  }

  return (
    <div
      ref={listRef}
      className={`tabs-list ${className || ""}`}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}