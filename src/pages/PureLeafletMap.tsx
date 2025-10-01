import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import AddPlantDialog from '@/components/AddPlantDialog';
import AddLawnDialog from '@/components/AddLawnDialog';

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

const PureLeafletMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [lawns, setLawns] = useState<LawnData[]>([]);
  const [addingPlantType, setAddingPlantType] = useState<'tree' | 'bush' | null>(null);
  const [addingLawn, setAddingLawn] = useState(false);
  const [lawnPoints, setLawnPoints] = useState<[number, number][]>([]);
  const [tempLawnData, setTempLawnData] = useState<{ grassType: string; area: number; healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory' } | null>(null);
  const [tempPlantData, setTempPlantData] = useState<any>(null);

  useEffect(() => {
    const storedPlants = localStorage.getItem('saratov-plants');
    const storedLawns = localStorage.getItem('saratov-lawns');
    
    if (storedPlants) {
      setPlants(JSON.parse(storedPlants));
    }

    if (storedLawns) {
      setLawns(JSON.parse(storedLawns));
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([51.533562, 46.034266], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('saratov-plants', JSON.stringify(plants));
    localStorage.setItem('saratov-lawns', JSON.stringify(lawns));
  }, [plants, lawns]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    plants.forEach(plant => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 24px;">${plant.type === 'tree' ? '🌳' : '🌿'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(plant.position, { icon })
        .bindPopup(`
          <div>
            <strong>${plant.species}</strong><br/>
            Возраст: ${plant.age} лет<br/>
            Высота: ${plant.height} м<br/>
            Состояние: ${plant.healthStatus === 'healthy' ? 'Здоровое' : plant.healthStatus === 'satisfactory' ? 'Удовлетворительное' : 'Неудовлетворительное'}<br/>
            <button onclick="window.deletePlant('${plant.id}')" style="margin-top: 8px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Удалить</button>
          </div>
        `);
      
      markersLayerRef.current!.addLayer(marker);
    });

    lawns.forEach(lawn => {
      const color = lawn.healthStatus === 'healthy' ? 'green' : lawn.healthStatus === 'satisfactory' ? 'yellow' : 'red';
      
      const polygon = L.polygon(lawn.positions, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3
      }).bindPopup(`
        <div>
          <strong>Газон</strong><br/>
          Тип травы: ${lawn.grassType}<br/>
          Площадь: ${lawn.area} м²<br/>
          Состояние: ${lawn.healthStatus === 'healthy' ? 'Здоровое' : lawn.healthStatus === 'satisfactory' ? 'Удовлетворительное' : 'Неудовлетворительное'}<br/>
          <button onclick="window.deleteLawn('${lawn.id}')" style="margin-top: 8px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Удалить</button>
        </div>
      `);
      
      markersLayerRef.current!.addLayer(polygon);
    });
  }, [plants, lawns]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (addingPlantType && tempPlantData) {
      const newPlant: PlantData = {
        id: Date.now().toString(),
        type: addingPlantType,
        position: [e.latlng.lat, e.latlng.lng],
        ...tempPlantData
      };
      
      setPlants([...plants, newPlant]);
      setAddingPlantType(null);
      setTempPlantData(null);
      toast({ title: 'Растение добавлено на карту' });
    }

    if (addingLawn && tempLawnData) {
      setLawnPoints([...lawnPoints, [e.latlng.lat, e.latlng.lng]]);
      
      if (lawnPoints.length >= 2) {
        const newLawn: LawnData = {
          id: Date.now().toString(),
          positions: [...lawnPoints, [e.latlng.lat, e.latlng.lng]],
          ...tempLawnData
        };
        
        setLawns([...lawns, newLawn]);
        setAddingLawn(false);
        setLawnPoints([]);
        setTempLawnData(null);
        toast({ title: 'Газон добавлен на карту' });
      }
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (addingPlantType || addingLawn) {
      mapInstanceRef.current.on('click', handleMapClick);
    } else {
      mapInstanceRef.current.off('click', handleMapClick);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, [addingPlantType, addingLawn, tempPlantData, tempLawnData, lawnPoints, plants, lawns]);

  useEffect(() => {
    (window as any).deletePlant = (id: string) => {
      setPlants(plants.filter(p => p.id !== id));
      toast({ title: 'Растение удалено' });
    };

    (window as any).deleteLawn = (id: string) => {
      setLawns(lawns.filter(l => l.id !== id));
      toast({ title: 'Газон удалён' });
    };
  }, [plants, lawns, toast]);

  const healthyCount = plants.filter(p => p.healthStatus === 'healthy').length + lawns.filter(l => l.healthStatus === 'healthy').length;
  const unsatisfactoryCount = plants.filter(p => p.healthStatus === 'unsatisfactory').length + lawns.filter(l => l.healthStatus === 'unsatisfactory').length;

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 z-[1000] space-y-4">
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trees" size={24} />
              Мониторинг зелёных насаждений
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Всего объектов:</span>
              <span className="font-bold text-lg">{plants.length + lawns.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Здоровых:</span>
              <span className="font-bold text-lg text-green-600">{healthyCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Требуют внимания:</span>
              <span className="font-bold text-lg text-red-600">{unsatisfactoryCount}</span>
            </div>
            <Button onClick={() => navigate('/table')} className="w-full mt-4">
              <Icon name="Table" size={16} className="mr-2" />
              Открыть реестр
            </Button>
          </CardContent>
        </Card>

        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-base">Добавить объект</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <AddPlantDialog 
              type="tree" 
              onAdd={(data) => {
                setTempPlantData(data);
                setAddingPlantType('tree');
                toast({ title: 'Кликните на карту для размещения дерева' });
              }} 
            />
            <AddPlantDialog 
              type="bush" 
              onAdd={(data) => {
                setTempPlantData(data);
                setAddingPlantType('bush');
                toast({ title: 'Кликните на карту для размещения кустарника' });
              }} 
            />
            <AddLawnDialog 
              onAdd={(data) => {
                setTempLawnData(data);
                setAddingLawn(true);
                setLawnPoints([]);
                toast({ title: 'Кликните на карту 3+ раз для создания полигона газона' });
              }} 
            />
            
            {(addingPlantType || addingLawn) && (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  setAddingPlantType(null);
                  setAddingLawn(false);
                  setTempPlantData(null);
                  setTempLawnData(null);
                  setLawnPoints([]);
                  toast({ title: 'Добавление отменено' });
                }}
              >
                <Icon name="X" size={16} className="mr-2" />
                Отменить
              </Button>
            )}
            
            {addingLawn && lawnPoints.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Точек: {lawnPoints.length}. Минимум 3 для завершения.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PureLeafletMap;