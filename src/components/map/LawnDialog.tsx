import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { LawnData } from './types';

interface LawnDialogProps {
  isOpen: boolean;
  lawn: LawnData | null;
  onOpenChange: (open: boolean) => void;
  onUpdateLawn: (lawn: LawnData) => void;
  onSave: () => void;
  onDelete: () => void;
}

const LawnDialog = ({ isOpen, lawn, onOpenChange, onUpdateLawn, onSave, onDelete }: LawnDialogProps) => {
  if (!lawn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Информация о газоне</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="area">Площадь (кв. м)</Label>
            <Input
              id="area"
              type="number"
              value={lawn.area}
              onChange={(e) => onUpdateLawn({...lawn, area: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label htmlFor="grassType">Тип травы</Label>
            <Input
              id="grassType"
              value={lawn.grassType}
              onChange={(e) => onUpdateLawn({...lawn, grassType: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="lawnHealthStatus">Состояние</Label>
            <Select
              value={lawn.healthStatus}
              onValueChange={(value: 'healthy' | 'satisfactory' | 'unsatisfactory') => 
                onUpdateLawn({...lawn, healthStatus: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Здоровое</SelectItem>
                <SelectItem value="satisfactory">Удовлетворительное</SelectItem>
                <SelectItem value="unsatisfactory">Неудовлетворительное</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1">
              Сохранить изменения
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Закрыть
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Button 
              onClick={onDelete} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <Icon name="Trash2" size={16} />
              Удалить газон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LawnDialog;
