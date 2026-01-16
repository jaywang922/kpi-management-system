import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* TODO: 工作日誌相關路由 */}
      {/* <Route path={"/work-logs"} component={WorkLogs} /> */}
      
      {/* TODO: 任務管理相關路由 */}
      {/* <Route path={"/tasks"} component={Tasks} /> */}
      
      {/* TODO: KPI追蹤相關路由 */}
      {/* <Route path={"/kpi"} component={KPI} /> */}
      
      {/* TODO: 績效評估相關路由 */}
      {/* <Route path={"/performance"} component={Performance} /> */}
      
      {/* TODO: 團隊管理相關路由 (主管) */}
      {/* <Route path={"/team"} component={Team} /> */}
      
      {/* TODO: 儀表板相關路由 (主管/董事長) */}
      {/* <Route path={"/dashboard"} component={Dashboard} /> */}
      
      {/* TODO: 系統設定相關路由 (管理員) */}
      {/* <Route path={"/settings"} component={Settings} /> */}
      
      {/* TODO: 通知中心 */}
      {/* <Route path={"/notifications"} component={Notifications} /> */}
      
      {/* TODO: 個人資料 */}
      {/* <Route path={"/profile"} component={Profile} /> */}
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
