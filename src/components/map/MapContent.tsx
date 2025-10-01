import { TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { PlantData, LawnData, CreationMode } from './types';
import { getHealthColor, createPlantIcon } from './utils';
import MapClickHandler from './MapClickHandler';

interface MapContentProps {
  plants: PlantData[];
  lawns: LawnData[];
  lawnPoints: [number, number][];
  creationMode: CreationMode;
  onPlantClick: (plant: PlantData) => void;
  onLawnClick: (lawn: LawnData) => void;
  onPlantCreate: (position: [number, number]) => void;
  onLawnPointAdd: (position: [number, number]) => void;
}

const MapContent = ({
  plants,
  lawns,
  lawnPoints,
  creationMode,
  onPlantClick,
  onLawnClick,
  onPlantCreate,
  onLawnPointAdd
}: MapContentProps) => {
  return (
    <>
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
            click: () => onPlantClick(plant)
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
            click: () => onLawnClick(lawn)
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
        onPlantCreate={onPlantCreate}
        onLawnPointAdd={onLawnPointAdd}
      />
    </>
  );
};

export default MapContent;
