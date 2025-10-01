import func2url from '../../func2url.json';

const API_URL = func2url.greenmap;

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

export const api = {
  async getPlants(): Promise<PlantData[]> {
    const response = await fetch(`${API_URL}?type=plants`);
    if (!response.ok) {
      console.error('HTTP', response.status, ':', API_URL);
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('Loaded plants:', data.plants?.length || 0);
    return data.plants || [];
  },

  async getLawns(): Promise<LawnData[]> {
    const response = await fetch(`${API_URL}?type=lawns`);
    if (!response.ok) {
      console.error('HTTP', response.status, ':', API_URL);
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('Loaded lawns:', data.lawns?.length || 0);
    return data.lawns || [];
  },

  async createPlant(plant: PlantData): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plant', data: plant })
    });
    if (!response.ok) {
      console.error('HTTP', response.status, ':', API_URL);
      const text = await response.text();
      console.error('Response:', text);
      throw new Error(`HTTP ${response.status}`);
    }
  },

  async createLawn(lawn: LawnData): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lawn', data: lawn })
    });
    if (!response.ok) {
      console.error('HTTP', response.status, ':', API_URL);
      const text = await response.text();
      console.error('Response:', text);
      throw new Error(`HTTP ${response.status}`);
    }
  },

  async deletePlant(id: string): Promise<void> {
    const response = await fetch(`${API_URL}?type=plant&id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  },

  async deleteLawn(id: string): Promise<void> {
    const response = await fetch(`${API_URL}?type=lawn&id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }
};