import L from 'leaflet';

export const getHealthColor = (status: 'healthy' | 'satisfactory' | 'unsatisfactory') => {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'satisfactory': return '#eab308';
    case 'unsatisfactory': return '#ef4444';
    default: return '#22c55e';
  }
};

export const createPlantIcon = (type: 'tree' | 'bush', healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory') => {
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
