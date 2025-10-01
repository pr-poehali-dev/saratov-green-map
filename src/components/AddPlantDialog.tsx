import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface AddPlantDialogProps {
  type: 'tree' | 'bush';
  onAdd: (plantData: {
    species: string;
    age: number;
    height: number;
    crownDiameter: number;
    damages: string;
    healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory';
  }) => void;
}

const AddPlantDialog = ({ type, onAdd }: AddPlantDialogProps) => {
  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [crownDiameter, setCrownDiameter] = useState('');
  const [damages, setDamages] = useState('');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'satisfactory' | 'unsatisfactory'>('healthy');

  const handleSubmit = () => {
    if (!species || !age || !height || !crownDiameter) return;

    onAdd({
      species,
      age: Number(age),
      height: Number(height),
      crownDiameter: Number(crownDiameter),
      damages,
      healthStatus
    });

    setSpecies('');
    setAge('');
    setHeight('');
    setCrownDiameter('');
    setDamages('');
    setHealthStatus('healthy');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Icon name={type === 'tree' ? 'Trees' : 'Leaf'} size={16} className="mr-2" />
          Добавить {type === 'tree' ? 'дерево' : 'кустарник'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить {type === 'tree' ? 'дерево' : 'кустарник'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Вид растения</Label>
            <Input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Например: Дуб обыкновенный" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Возраст (лет)</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="15" />
            </div>
            <div>
              <Label>Высота (м)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="8" />
            </div>
          </div>
          <div>
            <Label>Диаметр кроны (м)</Label>
            <Input type="number" value={crownDiameter} onChange={(e) => setCrownDiameter(e.target.value)} placeholder="5" />
          </div>
          <div>
            <Label>Повреждения</Label>
            <Input value={damages} onChange={(e) => setDamages(e.target.value)} placeholder="Описание повреждений" />
          </div>
          <div>
            <Label>Состояние</Label>
            <Select value={healthStatus} onValueChange={(v: any) => setHealthStatus(v)}>
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
          <Button onClick={handleSubmit} className="w-full">
            Добавить на карту
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantDialog;
