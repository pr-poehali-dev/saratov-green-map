import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { PlantData, LawnData, CreationMode, initialPlants, initialLawns } from '@/components/map/types';
import { getHealthColor, createPlantIcon } from '@/components/map/utils';
import MapClickHandler from '@/components/map/MapClickHandler';
import MapControls from '@/components/map/MapControls';
import PlantDialog from '@/components/map/PlantDialog';
import LawnDialog from '@/components/map/LawnDialog';

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

      <MapControls
        creationMode={creationMode}
        newPlantType={newPlantType}
        lawnPointsCount={lawnPoints.length}
        onSetCreationMode={setCreationMode}
        onSetNewPlantType={setNewPlantType}
        onNavigateToTable={() => navigate('/table')}
        onCompleteLawn={handleCompleteLawn}
        onCancelCreation={handleCancelCreation}
      />

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

      <PlantDialog
        isOpen={isDialogOpen && selectedPlant !== null}
        plant={selectedPlant}
        onOpenChange={setIsDialogOpen}
        onUpdatePlant={setSelectedPlant}
        onSave={handleSavePlant}
        onDelete={handleDeletePlant}
      />

      <LawnDialog
        isOpen={isDialogOpen && selectedLawn !== null}
        lawn={selectedLawn}
        onOpenChange={setIsDialogOpen}
        onUpdateLawn={setSelectedLawn}
        onSave={handleSaveLawn}
        onDelete={handleDeleteLawn}
      />
    </div>
  );
};

export default Index;
