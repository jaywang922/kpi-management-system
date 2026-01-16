import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase, ClipboardList } from "lucide-react";
import { useLocation } from "wouter";
import DepartmentManagement from "@/components/settings/DepartmentManagement";
import PositionManagement from "@/components/settings/PositionManagement";
import JobDutyManagement from "@/components/settings/JobDutyManagement";

export default function Settings() {
  const { user, loading } = useAuth();

  const [, setLocation] = useLocation();

  // 只有管理員和董事長可以訪問系統設定
  if (!loading && user && user.role !== "admin" && user.role !== "chairman") {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">載入中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系統設定</h1>
          <p className="text-muted-foreground mt-2">
            管理組織架構、職位和職掌設定
          </p>
        </div>

        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              部門管理
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              職位管理
            </TabsTrigger>
            <TabsTrigger value="job-duties" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              職掌管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>部門管理</CardTitle>
                <CardDescription>
                  新增、編輯或停用公司部門。部門是組織架構的基礎單位。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>職位管理</CardTitle>
                <CardDescription>
                  管理各部門的職位設定，每個職位需要關聯到特定部門。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PositionManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job-duties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>職掌管理</CardTitle>
                <CardDescription>
                  管理各職位的職掌項目，包含職掌編碼（如B1, D1, P7等）和詳細說明。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobDutyManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
