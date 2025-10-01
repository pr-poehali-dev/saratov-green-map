import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CreationMode } from './types';

interface MapControlsProps {
  creationMode: CreationMode;
  newPlantType: 'tree' | 'bush';
  lawnPointsCount: number;
  onSetCreationMode: (mode: CreationMode) => void;
  onSetNewPlantType: (type: 'tree' | 'bush') => void;
  onNavigateToTable: () => void;
  onCompleteLawn: () => void;
  onCancelCreation: () => void;
}

const MapControls = ({
  creationMode,
  newPlantType,
  lawnPointsCount,
  onSetCreationMode,
  onSetNewPlantType,
  onNavigateToTable,
  onCompleteLawn,
  onCancelCreation
}: MapControlsProps) => {
  return (
    <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20 space-y-3">
      {!creationMode ? (
        <>
          <Button 
            onClick={() => onSetCreationMode('plant')} 
            className="w-full flex items-center gap-2"
          >
            <Icon name="Trees" size={18} />
            Добавить растение
          </Button>
          <Button 
            onClick={() => onSetCreationMode('lawn')} 
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <Icon name="Square" size={18} />
            Добавить газон
          </Button>
          <Button 
            onClick={onNavigateToTable} 
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Icon name="Table" size={18} />
            Таблица объектов
          </Button>
        </>
      ) : creationMode === 'plant' ? (
        <div className="space-y-3">
          <Badge className="w-full justify-center py-2">
            <Icon name="MapPin" size={16} className="mr-2" />
            Кликните на карте
          </Badge>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant={newPlantType === 'tree' ? 'default' : 'outline'}
              onClick={() => onSetNewPlantType('tree')}
              className="flex-1"
            >
              🌳
            </Button>
            <Button 
              size="sm"
              variant={newPlantType === 'bush' ? 'default' : 'outline'}
              onClick={() => onSetNewPlantType('bush')}
              className="flex-1"
            >
              🌿
            </Button>
          </div>
          <Button 
            onClick={onCancelCreation} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            Отмена
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Badge className="w-full justify-center py-2">
            <Icon name="MapPin" size={16} className="mr-2" />
            Точек: {lawnPointsCount}
          </Badge>
          <Button 
            onClick={onCompleteLawn} 
            disabled={lawnPointsCount < 3}
            size="sm" 
            className="w-full"
          >
            Завершить
          </Button>
          <Button 
            onClick={onCancelCreation} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            Отмена
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapControls;
