import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const getHealthColor = (status: 'healthy' | 'satisfactory' | 'unsatisfactory') => {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'satisfactory': return '#eab308';
    case 'unsatisfactory': return '#ef4444';
    default: return '#22c55e';
  }
};

const createPlantIcon = (type: 'tree' | 'bush', healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory') => {
  const emoji = type === 'tree' ? '🌳' : '🌿';
  const color = getHealthColor(healthStatus);
  const size = type === 'tree' ? 32 : 28;
  
  return L.divIcon({
    html: `<div style="position: relative;">
      <div style="font-size: ${size}px;">${emoji}</div>
      <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background-color: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>`,
    className: 'custom-marker',
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12]
  });
};

interface PlantData {
  id: string;
  type: 'tree' | 'bush';
  species: string;
  age: number;
  crownDiameter: number;
  height: number;
  damages: string;
  healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory';
  position: [number, number];
}

interface LawnData {
  id: string;
  area: number;
  grassType: string;
  healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory';
  positions: [number, number][];
}

const initialPlants: PlantData[] = [
  {
    id: '1',
    type: 'tree',
    species: 'Клен ясенелистный',
    age: 15,
    crownDiameter: 4.5,
    height: 12,
    damages: 'Небольшое повреждение коры',
    healthStatus: 'satisfactory',
    position: [51.533562, 46.034266]
  },
  {
    id: '2',
    type: 'tree',
    species: 'Липа мелколистная',
    age: 20,
    crownDiameter: 5.2,
    height: 15,
    damages: 'Отсутствуют',
    healthStatus: 'healthy',
    position: [51.535, 46.036]
  },
  {
    id: '3',
    type: 'bush',
    species: 'Сирень обыкновенная',
    age: 8,
    crownDiameter: 2.1,
    height: 3.5,
    damages: 'Сухие ветви',
    healthStatus: 'satisfactory',
    position: [51.532, 46.037]
  }
];

const initialLawns: LawnData[] = [
  {
    id: 'lawn1',
    area: 450,
    grassType: 'Мятлик луговой',
    healthStatus: 'healthy',
    positions: [
      [51.534, 46.035],
      [51.534, 46.036],
      [51.533, 46.036],
      [51.533, 46.035]
    ]
  },
  {
    id: 'lawn2',
    area: 320,
    grassType: 'Овсяница красная',
    healthStatus: 'satisfactory',
    positions: [
      [51.532, 46.0345],
      [51.532, 46.0355],
      [51.5315, 46.0355],
      [51.5315, 46.0345]
    ]
  }
];

type CreationMode = 'plant' | 'lawn' | null;

const MapClickHandler = ({ 
  mode, 
  onPlantCreate, 
  onLawnPointAdd 
}: { 
  mode: CreationMode;
  onPlantCreate: (position: [number, number]) => void;
  onLawnPointAdd: (position: [number, number]) => void;
}) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (mode === 'plant') {
        onPlantCreate([lat, lng]);
      } else if (mode === 'lawn') {
        onLawnPointAdd([lat, lng]);
      }
    }
  });
  return null;
};

const Index = () => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [lawns, setLawns] = useState<LawnData[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [selectedLawn, setSelectedLawn] = useState<LawnData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [lawnPoints, setLawnPoints] = useState<[number, number][]>([]);
  const [newPlantType, setNewPlantType] = useState<'tree' | 'bush'>('tree');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlants = localStorage.getItem('saratov-plants');
    const storedLawns = localStorage.getItem('saratov-lawns');
    
    if (storedPlants) {
      setPlants(JSON.parse(storedPlants));
    } else {
      setPlants(initialPlants);
      localStorage.setItem('saratov-plants', JSON.stringify(initialPlants));
    }

    if (storedLawns) {
      setLawns(JSON.parse(storedLawns));
    } else {
      setLawns(initialLawns);
      localStorage.setItem('saratov-lawns', JSON.stringify(initialLawns));
    }
  }, []);

  const handlePlantClick = (plant: PlantData) => {
    setSelectedPlant(plant);
    setSelectedLawn(null);
    setIsDialogOpen(true);
  };

  const handleLawnClick = (lawn: LawnData) => {
    setSelectedLawn(lawn);
    setSelectedPlant(null);
    setIsDialogOpen(true);
  };

  const handleSavePlant = () => {
    if (!selectedPlant) return;

    const updatedPlants = plants.map(p => 
      p.id === selectedPlant.id ? selectedPlant : p
    );
    setPlants(updatedPlants);
    localStorage.setItem('saratov-plants', JSON.stringify(updatedPlants));
    
    toast({
      title: "Изменения сохранены",
      description: "Данные о растении успешно обновлены"
    });
    
    setIsDialogOpen(false);
  };

  const handleSaveLawn = () => {
    if (!selectedLawn) return;

    const updatedLawns = lawns.map(l => 
      l.id === selectedLawn.id ? selectedLawn : l
    );
    setLawns(updatedLawns);
    localStorage.setItem('saratov-lawns', JSON.stringify(updatedLawns));
    
    toast({
      title: "Изменения сохранены",
      description: "Данные о газоне успешно обновлены"
    });
    
    setIsDialogOpen(false);
  };

  const handleCreatePlant = (position: [number, number]) => {
    const newPlant: PlantData = {
      id: Date.now().toString(),
      type: newPlantType,
      species: newPlantType === 'tree' ? 'Новое дерево' : 'Новый кустарник',
      age: 0,
      crownDiameter: 0,
      height: 0,
      damages: '',
      healthStatus: 'healthy',
      position
    };
    
    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    localStorage.setItem('saratov-plants', JSON.stringify(updatedPlants));
    
    toast({
      title: "Объект создан",
      description: `${newPlantType === 'tree' ? 'Дерево' : 'Кустарник'} добавлено на карту`
    });
    
    setCreationMode(null);
    setSelectedPlant(newPlant);
    setIsDialogOpen(true);
  };

  const handleAddLawnPoint = (position: [number, number]) => {
    setLawnPoints([...lawnPoints, position]);
    toast({
      title: "Точка добавлена",
      description: `Точек в полигоне: ${lawnPoints.length + 1}`
    });
  };

  const handleCompleteLawn = () => {
    if (lawnPoints.length < 3) {
      toast({
        title: "Недостаточно точек",
        description: "Для создания газона нужно минимум 3 точки",
        variant: "destructive"
      });
      return;
    }

    const newLawn: LawnData = {
      id: Date.now().toString(),
      area: 0,
      grassType: 'Новый газон',
      healthStatus: 'healthy',
      positions: lawnPoints
    };

    const updatedLawns = [...lawns, newLawn];
    setLawns(updatedLawns);
    localStorage.setItem('saratov-lawns', JSON.stringify(updatedLawns));

    toast({
      title: "Газон создан",
      description: "Газон добавлен на карту"
    });

    setLawnPoints([]);
    setCreationMode(null);
    setSelectedLawn(newLawn);
    setIsDialogOpen(true);
  };

  const handleCancelCreation = () => {
    setCreationMode(null);
    setLawnPoints([]);
    toast({
      title: "Отменено",
      description: "Создание объекта отменено"
    });
  };

  const handleDeletePlant = () => {
    if (!selectedPlant) return;

    const updatedPlants = plants.filter(p => p.id !== selectedPlant.id);
    setPlants(updatedPlants);
    localStorage.setItem('saratov-plants', JSON.stringify(updatedPlants));

    toast({
      title: "Объект удалён",
      description: "Растение удалено с карты"
    });

    setIsDialogOpen(false);
    setSelectedPlant(null);
  };

  const handleDeleteLawn = () => {
    if (!selectedLawn) return;

    const updatedLawns = lawns.filter(l => l.id !== selectedLawn.id);
    setLawns(updatedLawns);
    localStorage.setItem('saratov-lawns', JSON.stringify(updatedLawns));

    toast({
      title: "Объект удалён",
      description: "Газон удалён с карты"
    });

    setIsDialogOpen(false);
    setSelectedLawn(null);
  };

  return (
    <div className="relative w-screen h-screen">
      <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-primary/20">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Icon name="Trees" size={28} className="text-primary" />
          Карта зелёных насаждений Саратова
        </h1>
      </div>

      <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20 space-y-3">
        {!creationMode ? (
          <>
            <Button 
              onClick={() => setCreationMode('plant')} 
              className="w-full flex items-center gap-2"
            >
              <Icon name="Trees" size={18} />
              Добавить растение
            </Button>
            <Button 
              onClick={() => setCreationMode('lawn')} 
              className="w-full flex items-center gap-2"
              variant="secondary"
            >
              <Icon name="Square" size={18} />
              Добавить газон
            </Button>
            <Button 
              onClick={() => navigate('/table')} 
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
                onClick={() => setNewPlantType('tree')}
                className="flex-1"
              >
                🌳
              </Button>
              <Button 
                size="sm"
                variant={newPlantType === 'bush' ? 'default' : 'outline'}
                onClick={() => setNewPlantType('bush')}
                className="flex-1"
              >
                🌿
              </Button>
            </div>
            <Button 
              onClick={handleCancelCreation} 
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
              Точек: {lawnPoints.length}
            </Badge>
            <Button 
              onClick={handleCompleteLawn} 
              disabled={lawnPoints.length < 3}
              size="sm" 
              className="w-full"
            >
              Завершить
            </Button>
            <Button 
              onClick={handleCancelCreation} 
              variant="destructive" 
              size="sm" 
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        )}
      </div>

      <MapContainer 
        center={[51.533562, 46.034266]} 
        zoom={16} 
        style={{ height: '100vh', width: '100vw' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {plants.map(plant => (
          <Marker 
            key={plant.id}
            position={plant.position}
            icon={createPlantIcon(plant.type, plant.healthStatus)}
            eventHandlers={{
              click: () => handlePlantClick(plant)
            }}
          >
            <Popup>
              <div className="font-roboto">
                <strong>{plant.species}</strong>
                <br />
                Возраст: {plant.age} лет
              </div>
            </Popup>
          </Marker>
        ))}

        {lawns.map(lawn => (
          <Polygon
            key={lawn.id}
            positions={lawn.positions}
            pathOptions={{
              color: getHealthColor(lawn.healthStatus),
              fillColor: getHealthColor(lawn.healthStatus),
              fillOpacity: 0.3,
              weight: 3
            }}
            eventHandlers={{
              click: () => handleLawnClick(lawn)
            }}
          >
            <Popup>
              <div className="font-roboto">
                <strong>Газон</strong>
                <br />
                Площадь: {lawn.area} м²
              </div>
            </Popup>
          </Polygon>
        ))}

        {lawnPoints.length > 0 && (
          <Polygon
            positions={lawnPoints}
            pathOptions={{
              color: '#2D5016',
              fillColor: '#beee90',
              fillOpacity: 0.4,
              weight: 2,
              dashArray: '10, 10'
            }}
          />
        )}

        <MapClickHandler 
          mode={creationMode} 
          onPlantCreate={handleCreatePlant}
          onLawnPointAdd={handleAddLawnPoint}
        />
      </MapContainer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {selectedPlant ? 'Карточка растения' : 'Информация о газоне'}
            </DialogTitle>
          </DialogHeader>

          {selectedPlant && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="species">Вид растения</Label>
                <Input
                  id="species"
                  value={selectedPlant.species}
                  onChange={(e) => setSelectedPlant({...selectedPlant, species: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="age">Возраст (лет)</Label>
                <Input
                  id="age"
                  type="number"
                  value={selectedPlant.age}
                  onChange={(e) => setSelectedPlant({...selectedPlant, age: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="crownDiameter">Диаметр кроны (м)</Label>
                <Input
                  id="crownDiameter"
                  type="number"
                  step="0.1"
                  value={selectedPlant.crownDiameter}
                  onChange={(e) => setSelectedPlant({...selectedPlant, crownDiameter: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="height">Высота (м)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={selectedPlant.height}
                  onChange={(e) => setSelectedPlant({...selectedPlant, height: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="damages">Наличие повреждений</Label>
                <Textarea
                  id="damages"
                  value={selectedPlant.damages}
                  onChange={(e) => setSelectedPlant({...selectedPlant, damages: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="healthStatus">Состояние здоровья</Label>
                <Select
                  value={selectedPlant.healthStatus}
                  onValueChange={(value: 'healthy' | 'satisfactory' | 'unsatisfactory') => 
                    setSelectedPlant({...selectedPlant, healthStatus: value})
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
                <Button onClick={handleSavePlant} className="flex-1">
                  Сохранить изменения
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                  Закрыть
                </Button>
              </div>
              
              <div className="pt-2 border-t">
                <Button 
                  onClick={handleDeletePlant} 
                  variant="destructive" 
                  className="w-full flex items-center gap-2"
                >
                  <Icon name="Trash2" size={16} />
                  Удалить объект
                </Button>
              </div>
            </div>
          )}

          {selectedLawn && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="area">Площадь (кв. м)</Label>
                <Input
                  id="area"
                  type="number"
                  value={selectedLawn.area}
                  onChange={(e) => setSelectedLawn({...selectedLawn, area: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="grassType">Тип травы</Label>
                <Input
                  id="grassType"
                  value={selectedLawn.grassType}
                  onChange={(e) => setSelectedLawn({...selectedLawn, grassType: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="lawnHealthStatus">Состояние</Label>
                <Select
                  value={selectedLawn.healthStatus}
                  onValueChange={(value: 'healthy' | 'satisfactory' | 'unsatisfactory') => 
                    setSelectedLawn({...selectedLawn, healthStatus: value})
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
                <Button onClick={handleSaveLawn} className="flex-1">
                  Сохранить изменения
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                  Закрыть
                </Button>
              </div>

              <div className="pt-2 border-t">
                <Button 
                  onClick={handleDeleteLawn} 
                  variant="destructive" 
                  className="w-full flex items-center gap-2"
                >
                  <Icon name="Trash2" size={16} />
                  Удалить газон
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;