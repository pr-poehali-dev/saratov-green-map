export interface PlantData {
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

export interface LawnData {
  id: string;
  area: number;
  grassType: string;
  healthStatus: 'healthy' | 'satisfactory' | 'unsatisfactory';
  positions: [number, number][];
}

export type CreationMode = 'plant' | 'lawn' | null;

export const initialPlants: PlantData[] = [
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

export const initialLawns: LawnData[] = [
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
