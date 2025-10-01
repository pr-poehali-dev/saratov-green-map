import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const PureLeafletMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);
  
  const [points, setPoints] = useState<Array<{lat: number, lng: number, name: string}>>([]);
  const [newPointName, setNewPointName] = useState('');
  const [isAddingPoint, setIsAddingPoint] = useState(false);

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

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng])
        .addTo(mapInstanceRef.current!)
        .bindPopup(`${index + 1}. ${point.name}`);
      markersRef.current.push(marker);
    });

    if (routeLineRef.current) {
      routeLineRef.current.remove();
    }

    if (points.length > 1) {
      const latlngs: [number, number][] = points.map(p => [p.lat, p.lng]);
      routeLineRef.current = L.polyline(latlngs, {
        color: 'blue',
        weight: 3,
        opacity: 0.7
      }).addTo(mapInstanceRef.current!);
    }
  }, [points]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isAddingPoint || !newPointName.trim()) return;
    
    setPoints([...points, {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      name: newPointName
    }]);
    setNewPointName('');
    setIsAddingPoint(false);
  };

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (isAddingPoint) {
      mapInstanceRef.current.on('click', handleMapClick);
    } else {
      mapInstanceRef.current.off('click', handleMapClick);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, [isAddingPoint, newPointName, points]);

  const deletePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setPoints([]);
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-[1000]">
        <h2 className="text-xl font-bold mb-4">Планирование маршрута</h2>
        
        <div className="space-y-3 mb-4">
          <Input
            placeholder="Название точки"
            value={newPointName}
            onChange={(e) => setNewPointName(e.target.value)}
          />
          <Button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            variant={isAddingPoint ? "destructive" : "default"}
            className="w-full"
          >
            <Icon name={isAddingPoint ? "X" : "MapPin"} size={16} className="mr-2" />
            {isAddingPoint ? 'Отменить' : 'Добавить точку на карте'}
          </Button>
        </div>

        {isAddingPoint && (
          <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
            Кликните на карту, чтобы добавить точку "{newPointName}"
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {points.map((point, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex-1">
                <span className="font-semibold">{index + 1}. </span>
                {point.name}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deletePoint(index)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))}
        </div>

        {points.length > 0 && (
          <Button onClick={clearAll} variant="outline" className="w-full">
            <Icon name="Trash" size={16} className="mr-2" />
            Очистить всё
          </Button>
        )}
      </div>
    </div>
  );
};

export default PureLeafletMap;