import { useMapEvents } from 'react-leaflet';
import { CreationMode } from './types';

interface MapClickHandlerProps {
  mode: CreationMode;
  onPlantCreate: (position: [number, number]) => void;
  onLawnPointAdd: (position: [number, number]) => void;
}

const MapClickHandler = ({ mode, onPlantCreate, onLawnPointAdd }: MapClickHandlerProps) => {
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

export default MapClickHandler;
