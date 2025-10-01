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
    const data = await response.json();
    return data.plants || [];
  },

  async getLawns(): Promise<LawnData[]> {
    const response = await fetch(`${API_URL}?type=lawns`);
    const data = await response.json();
    return data.lawns || [];
  },

  async createPlant(plant: PlantData): Promise<void> {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plant', data: plant })
    });
  },

  async createLawn(lawn: LawnData): Promise<void> {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lawn', data: lawn })
    });
  },

  async deletePlant(id: string): Promise<void> {
    await fetch(`${API_URL}?type=plant&id=${id}`, {
      method: 'DELETE'
    });
  },

  async deleteLawn(id: string): Promise<void> {
    await fetch(`${API_URL}?type=lawn&id=${id}`, {
      method: 'DELETE'
    });
  }
};
