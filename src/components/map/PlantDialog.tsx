import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { PlantData } from './types';

interface PlantDialogProps {
  isOpen: boolean;
  plant: PlantData | null;
  onOpenChange: (open: boolean) => void;
  onUpdatePlant: (plant: PlantData) => void;
  onSave: () => void;
  onDelete: () => void;
}

const PlantDialog = ({ isOpen, plant, onOpenChange, onUpdatePlant, onSave, onDelete }: PlantDialogProps) => {
  if (!plant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Карточка растения</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="species">Вид растения</Label>
            <Input
              id="species"
              value={plant.species}
              onChange={(e) => onUpdatePlant({...plant, species: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="age">Возраст (лет)</Label>
            <Input
              id="age"
              type="number"
              value={plant.age}
              onChange={(e) => onUpdatePlant({...plant, age: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label htmlFor="crownDiameter">Диаметр кроны (м)</Label>
            <Input
              id="crownDiameter"
              type="number"
              step="0.1"
              value={plant.crownDiameter}
              onChange={(e) => onUpdatePlant({...plant, crownDiameter: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label htmlFor="height">Высота (м)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={plant.height}
              onChange={(e) => onUpdatePlant({...plant, height: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label htmlFor="damages">Наличие повреждений</Label>
            <Textarea
              id="damages"
              value={plant.damages}
              onChange={(e) => onUpdatePlant({...plant, damages: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="healthStatus">Состояние здоровья</Label>
            <Select
              value={plant.healthStatus}
              onValueChange={(value: 'healthy' | 'satisfactory' | 'unsatisfactory') => 
                onUpdatePlant({...plant, healthStatus: value})
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
              Удалить объект
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlantDialog;
