import { createContext, useContext, useState } from "react"
import './Tabs.css'

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}


type TabsProps = {
  defaultValue: string
  orientation?: "horizontal" | "vertical"
  className?: string
  children: React.ReactNode
}
export const Tabs: React.FC<TabsProps> = ({ defaultValue, orientation = "horizontal", className = "", children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div className={`tabs ${orientation} ${className || ""}`} data-orientation={orientation}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}