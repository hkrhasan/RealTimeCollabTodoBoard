import { useTabsContext } from "."

type TabsTriggerProps = {
  value: string
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className = "", disabled = false, children }) => {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      className={`tabs-trigger ${isActive ? "active" : ""} ${disabled ? "disabled" : ""} ${className || ""}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  )
}