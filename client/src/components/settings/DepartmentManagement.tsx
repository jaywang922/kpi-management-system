import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DepartmentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const utils = trpc.useUtils();
  const { data: departments, isLoading } = trpc.organization.getDepartments.useQuery();

  const createMutation = trpc.organization.createDepartment.useMutation({
    onSuccess: () => {
      toast.success("部門創建成功");
      utils.organization.getDepartments.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`創建失敗: ${error.message}`);
    },
  });

  const updateMutation = trpc.organization.updateDepartment.useMutation({
    onSuccess: () => {
      toast.success("部門更新成功");
      utils.organization.getDepartments.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.organization.toggleDepartmentActive.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "部門已啟用" : "部門已停用");
      utils.organization.getDepartments.invalidate();
    },
    onError: (error) => {
      toast.error(`操作失敗: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "" });
    setEditingDept(null);
  };

  const handleOpenDialog = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("請填寫部門名稱和編碼");
      return;
    }

    if (editingDept) {
      updateMutation.mutate({
        id: editingDept.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          共 {departments?.length || 0} 個部門
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              新增部門
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingDept ? "編輯部門" : "新增部門"}</DialogTitle>
                <DialogDescription>
                  {editingDept ? "修改部門資訊" : "創建新的部門"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">部門名稱 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：北區業務部"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">部門編碼 *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="例如：SN"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    用於職掌編碼，例如：SN（北區）、SM（中區）、SS（南區）
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">部門說明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="部門職責和說明"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "處理中..." : "確定"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>部門名稱</TableHead>
              <TableHead>編碼</TableHead>
              <TableHead>說明</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dept.code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{dept.description || "-"}</TableCell>
                  <TableCell>
                    {dept.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        啟用中
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Ban className="h-3 w-3 mr-1" />
                        已停用
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(dept)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(dept.id, dept.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {dept.isActive ? (
                          <Ban className="h-4 w-4 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暫無部門資料，請點擊「新增部門」開始建立
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
