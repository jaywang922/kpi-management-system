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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function PositionManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    level: "staff" as "staff" | "supervisor" | "manager" | "director",
    description: "",
  });

  const utils = trpc.useUtils();
  const { data: positions, isLoading } = trpc.organization.getPositions.useQuery();
  const { data: departments } = trpc.organization.getDepartments.useQuery();

  const createMutation = trpc.organization.createPosition.useMutation({
    onSuccess: () => {
      toast.success("職位創建成功");
      utils.organization.getPositions.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`創建失敗: ${error.message}`);
    },
  });

  const updateMutation = trpc.organization.updatePosition.useMutation({
    onSuccess: () => {
      toast.success("職位更新成功");
      utils.organization.getPositions.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.organization.togglePositionActive.useMutation({
    onSuccess: (_: any, variables: any) => {
      toast.success(variables.isActive ? "職位已啟用" : "職位已停用");
      utils.organization.getPositions.invalidate();
    },
    onError: (error: any) => {
      toast.error(`操作失敗: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      departmentId: "",
      title: "",
      level: "staff",
      description: "",
    });
    setEditingPosition(null);
  };

  const handleOpenDialog = (position?: any) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        departmentId: position.departmentId.toString(),
        title: position.title,
        level: position.level,
        description: position.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departmentId || !formData.title.trim()) {
      toast.error("請填寫部門和職位名稱");
      return;
    }

    const data = {
      ...formData,
      departmentId: parseInt(formData.departmentId),
    };

    if (editingPosition) {
      updateMutation.mutate({
        id: editingPosition.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      staff: "員工",
      supervisor: "主管",
      manager: "經理",
      director: "總監",
    };
    return labels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeDepartments = departments?.filter(d => d.isActive) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          共 {positions?.length || 0} 個職位
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              新增職位
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPosition ? "編輯職位" : "新增職位"}</DialogTitle>
                <DialogDescription>
                  {editingPosition ? "修改職位資訊" : "創建新的職位"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="department">所屬部門 *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇部門" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">職位名稱 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：業務經理"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">職級</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">員工</SelectItem>
                      <SelectItem value="supervisor">主管</SelectItem>
                      <SelectItem value="manager">經理</SelectItem>
                      <SelectItem value="director">總監</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">職位說明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="職位職責和說明"
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
              <TableHead>職位名稱</TableHead>
              <TableHead>所屬部門</TableHead>
              <TableHead>職級</TableHead>
              <TableHead>說明</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions && positions.length > 0 ? (
              positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {position.department?.name} ({position.department?.code})
                    </Badge>
                  </TableCell>
                  <TableCell>{getLevelLabel(position.level)}</TableCell>
                  <TableCell className="max-w-xs truncate">{position.description || "-"}</TableCell>
                  <TableCell>
                    {position.isActive ? (
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
                        onClick={() => handleOpenDialog(position)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(position.id, position.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {position.isActive ? (
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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暫無職位資料，請點擊「新增職位」開始建立
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
