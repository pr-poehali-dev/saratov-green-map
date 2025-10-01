import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface AddLawnDialogProps {
  onAdd: (lawnData: {
    grassType: string;
    area: number;
    healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory';
  }) => void;
}

const AddLawnDialog = ({ onAdd }: AddLawnDialogProps) => {
  const [open, setOpen] = useState(false);
  const [grassType, setGrassType] = useState('');
  const [area, setArea] = useState('');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'satisfactory' | 'unsatisfactory'>('healthy');

  const handleSubmit = () => {
    if (!grassType || !area) return;

    onAdd({
      grassType,
      area: Number(area),
      healthStatus
    });

    setGrassType('');
    setArea('');
    setHealthStatus('healthy');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Icon name="Square" size={16} className="mr-2" />
          Добавить газон
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[10000]">
        <DialogHeader>
          <DialogTitle>Добавить газон</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Тип травы</Label>
            <Input value={grassType} onChange={(e) => setGrassType(e.target.value)} placeholder="Например: Мятлик луговой" />
          </div>
          <div>
            <Label>Площадь (м²)</Label>
            <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="250" />
          </div>
          <div>
            <Label>Состояние</Label>
            <Select value={healthStatus} onValueChange={(v: any) => setHealthStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="healthy">Здоровое</SelectItem>
                <SelectItem value="satisfactory">Удовлетворительное</SelectItem>
                <SelectItem value="unsatisfactory">Неудовлетворительное</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Добавить на карту
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLawnDialog;