import { useTabsContext } from "."

type TabsContentProps = {
  value: string
  className?: string
  children: React.ReactNode
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, className = "", children }) => {
  const { activeTab } = useTabsContext()
  const isActive = activeTab === value

  if (!isActive) return null

  return (
    <div
      className={`tabs-content ${className || ""}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`panel-${value}`}
      tabIndex={0}
    >
      {children}
    </div>
  )
}