import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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
  const navigate = useNavigate();
  
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [lawns, setLawns] = useState<LawnData[]>([]);

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

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    plants.forEach(plant => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 24px;">${plant.type === 'tree' ? '🌳' : '🌿'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker(plant.position, { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <strong>${plant.species}</strong><br/>
          Возраст: ${plant.age} лет<br/>
          Высота: ${plant.height} м<br/>
          Состояние: ${plant.healthStatus === 'healthy' ? 'Здоровое' : plant.healthStatus === 'satisfactory' ? 'Удовлетворительное' : 'Неудовлетворительное'}
        `);
    });

    lawns.forEach(lawn => {
      const color = lawn.healthStatus === 'healthy' ? 'green' : lawn.healthStatus === 'satisfactory' ? 'yellow' : 'red';
      
      L.polygon(lawn.positions, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3
      }).addTo(mapInstanceRef.current!)
        .bindPopup(`
          <strong>Газон</strong><br/>
          Тип травы: ${lawn.grassType}<br/>
          Площадь: ${lawn.area} м²<br/>
          Состояние: ${lawn.healthStatus === 'healthy' ? 'Здоровое' : lawn.healthStatus === 'satisfactory' ? 'Удовлетворительное' : 'Неудовлетворительное'}
        `);
    });
  }, [plants, lawns]);

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
      </div>
    </div>
  );
};

export default PureLeafletMap;