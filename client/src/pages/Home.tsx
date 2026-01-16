import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, ListTodo, Target, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  // 獲取基本統計數據
  const { data: myTasks } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: unreadNotifications } = trpc.notification.getUnreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  // 統計數據
  const pendingTasks = myTasks?.filter(t => t.status === "assigned" || t.status === "in_progress").length || 0;
  const completedTasks = myTasks?.filter(t => t.status === "completed").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 歡迎區域 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            歡迎回來，{user?.name || "使用者"}！
          </h1>
          <p className="text-muted-foreground mt-2">
            這是您的績效管理工作台，快速查看您的工作狀態和待辦事項。
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待處理任務</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                需要您關注的任務
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成任務</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                本月累計完成
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未讀通知</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                需要查看的通知
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月績效</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                KPI達成率
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/work-logs">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>工作日誌</CardTitle>
                </div>
                <CardDescription>
                  記錄每天的工作內容，與職掌對應，主管複評
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  前往工作日誌
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/tasks">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  <CardTitle>我的任務</CardTitle>
                </div>
                <CardDescription>
                  查看主管交辦的任務，回報進度，提交結案報告
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  查看我的任務
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/kpi">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>KPI追蹤</CardTitle>
                </div>
                <CardDescription>
                  錄入KPI實際值，追蹤達成率，查看績效趨勢
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  前往KPI追蹤
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* 最近活動 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活動</CardTitle>
            <CardDescription>
              您最近的工作動態和系統通知
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText className="w-full h-full" />
              </div>
              <div className="empty-state-title">暫無最近活動</div>
              <div className="empty-state-description">
                當您開始使用系統記錄工作日誌、處理任務時，相關活動會顯示在這裡。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
