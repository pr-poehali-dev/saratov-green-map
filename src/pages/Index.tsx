import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
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

const treeIcon = L.divIcon({
  html: '<div style="font-size: 32px;">🌳</div>',
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const bushIcon = L.divIcon({
  html: '<div style="font-size: 28px;">🌿</div>',
  className: 'custom-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

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

const Index = () => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [lawns, setLawns] = useState<LawnData[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [selectedLawn, setSelectedLawn] = useState<LawnData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="relative w-screen h-screen">
      <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-primary/20">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Icon name="Trees" size={28} className="text-primary" />
          Карта зелёных насаждений Саратова
        </h1>
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
            icon={plant.type === 'tree' ? treeIcon : bushIcon}
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
              color: '#8B7355',
              fillColor: '#beee90',
              fillOpacity: 0.6,
              weight: 2
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
