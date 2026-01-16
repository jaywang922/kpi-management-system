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

export default function JobDutyManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<any>(null);
  const [formData, setFormData] = useState({
    positionId: "",
    code: "",
    title: "",
    description: "",
    category: "",
    sortOrder: "0",
  });

  const utils = trpc.useUtils();
  const { data: jobDuties, isLoading } = trpc.organization.getJobDuties.useQuery();
  const { data: positions } = trpc.organization.getPositions.useQuery();

  const createMutation = trpc.organization.createJobDuty.useMutation({
    onSuccess: () => {
      toast.success("職掌創建成功");
      utils.organization.getJobDuties.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`創建失敗: ${error.message}`);
    },
  });

  const updateMutation = trpc.organization.updateJobDuty.useMutation({
    onSuccess: () => {
      toast.success("職掌更新成功");
      utils.organization.getJobDuties.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.organization.toggleJobDutyActive.useMutation({
    onSuccess: (_: any, variables: any) => {
      toast.success(variables.isActive ? "職掌已啟用" : "職掌已停用");
      utils.organization.getJobDuties.invalidate();
    },
    onError: (error: any) => {
      toast.error(`操作失敗: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      positionId: "",
      code: "",
      title: "",
      description: "",
      category: "",
      sortOrder: "0",
    });
    setEditingDuty(null);
  };

  const handleOpenDialog = (duty?: any) => {
    if (duty) {
      setEditingDuty(duty);
      setFormData({
        positionId: duty.positionId.toString(),
        code: duty.code,
        title: duty.title,
        description: duty.description || "",
        category: duty.category || "",
        sortOrder: duty.sortOrder?.toString() || "0",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.positionId || !formData.code.trim() || !formData.title.trim()) {
      toast.error("請填寫職位、職掌編碼和職掌名稱");
      return;
    }

    const data = {
      ...formData,
      positionId: parseInt(formData.positionId),
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    if (editingDuty) {
      updateMutation.mutate({
        id: editingDuty.id,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activePositions = positions?.filter(p => p.isActive) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          共 {jobDuties?.length || 0} 個職掌
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              新增職掌
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingDuty ? "編輯職掌" : "新增職掌"}</DialogTitle>
                <DialogDescription>
                  {editingDuty ? "修改職掌資訊" : "創建新的職掌項目"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">所屬職位 *</Label>
                  <Select
                    value={formData.positionId}
                    onValueChange={(value) => setFormData({ ...formData, positionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇職位" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id.toString()}>
                          {pos.title} - {pos.department?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">職掌編碼 *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="例如：B1, SN1"
                      maxLength={20}
                    />
                    <p className="text-xs text-muted-foreground">
                      使用部門代碼+數字，例如：B1, D1, SN1
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">職掌類別</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="例如：系統作業、人事作業"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">職掌名稱 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：系統作業、製作業績統計表"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">職掌說明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="詳細描述職掌內容和要求"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">排序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    數字越小越靠前顯示
                  </p>
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
              <TableHead>職掌編碼</TableHead>
              <TableHead>職掌名稱</TableHead>
              <TableHead>所屬職位</TableHead>
              <TableHead>所屬部門</TableHead>
              <TableHead>類別</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobDuties && jobDuties.length > 0 ? (
              jobDuties.map((duty) => (
                <TableRow key={duty.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{duty.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{duty.title}</TableCell>
                  <TableCell>{duty.position?.title || "-"}</TableCell>
                  <TableCell>
                    {duty.position?.department ? (
                      <Badge variant="secondary">
                        {duty.position.department.name} ({duty.position.department.code})
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{duty.category || "-"}</TableCell>
                  <TableCell>
                    {duty.isActive ? (
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
                        onClick={() => handleOpenDialog(duty)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(duty.id, duty.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {duty.isActive ? (
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  暫無職掌資料，請點擊「新增職掌」開始建立
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
