import ActivityPanel from "../../components/ActivityPanel";
import Header from "../../components/Header";
import KanbanBoard from "../../components/KanbanBoard";
import { Tabs } from "../../components/Tabs";
import { TabsContent } from "../../components/Tabs/TabsContent";
import { TabsList } from "../../components/Tabs/TabsList";
import { TabsTrigger } from "../../components/Tabs/TabsTrigger";
import { SocketProvider } from "../../contexts/SocketContext";
import "./Dashboard.css"

function DashboardPage() {
  return <div className="dashboard">
    <Header />
    <div className="separator"></div>

    <div className="dashboard-content">
      <Tabs defaultValue="board" className="">
        <TabsList>
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <SocketProvider boardId={import.meta.env.VITE_DEFAULT_BOARD_ID}>
            <KanbanBoard />
          </SocketProvider>
        </TabsContent>
        <TabsContent value="activity">
          <ActivityPanel />
        </TabsContent>
      </Tabs>
    </div>
  </div>
}

export default DashboardPage;