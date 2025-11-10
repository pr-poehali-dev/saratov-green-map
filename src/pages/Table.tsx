import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

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

const getHealthStatusLabel = (status: 'healthy' | 'satisfactory' | 'unsatisfactory') => {
  switch (status) {
    case 'healthy': return 'Здоровое';
    case 'satisfactory': return 'Удовлетворительное';
    case 'unsatisfactory': return 'Неудовлетворительное';
    default: return 'Не указано';
  }
};

const getHealthStatusVariant = (status: 'healthy' | 'satisfactory' | 'unsatisfactory'): "default" | "secondary" | "destructive" => {
  switch (status) {
    case 'healthy': return 'default';
    case 'satisfactory': return 'secondary';
    case 'unsatisfactory': return 'destructive';
    default: return 'default';
  }
};

const TablePage = () => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [lawns, setLawns] = useState<LawnData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantsData, lawnsData] = await Promise.all([
          api.getPlants(),
          api.getLawns()
        ]);
        setPlants(plantsData);
        setLawns(lawnsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    loadData();
  }, []);

  const healthyPlants = plants.filter(p => p.healthStatus === 'healthy').length;
  const satisfactoryPlants = plants.filter(p => p.healthStatus === 'satisfactory').length;
  const unsatisfactoryPlants = plants.filter(p => p.healthStatus === 'unsatisfactory').length;

  const healthyLawns = lawns.filter(l => l.healthStatus === 'healthy').length;
  const satisfactoryLawns = lawns.filter(l => l.healthStatus === 'satisfactory').length;
  const unsatisfactoryLawns = lawns.filter(l => l.healthStatus === 'unsatisfactory').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Icon name="Table" size={32} />
              Реестр зелёных насаждений
            </h1>
            <p className="text-muted-foreground mt-2">Полная информация об объектах мониторинга</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
            <Icon name="Map" size={18} />
            Вернуться к карте
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего объектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{plants.length + lawns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {plants.length} растений, {lawns.length} газонов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Здоровые</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{healthyPlants + healthyLawns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                В отличном состоянии
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Требуют внимания</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{unsatisfactoryPlants + unsatisfactoryLawns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Неудовлетворительное состояние
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plants" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="plants" className="flex items-center gap-2">
              <Icon name="Trees" size={16} />
              Растения ({plants.length})
            </TabsTrigger>
            <TabsTrigger value="lawns" className="flex items-center gap-2">
              <Icon name="Square" size={16} />
              Газоны ({lawns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Деревья и кустарники</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Тип</TableHead>
                        <TableHead>Вид растения</TableHead>
                        <TableHead>Возраст</TableHead>
                        <TableHead>Высота</TableHead>
                        <TableHead>Диаметр кроны</TableHead>
                        <TableHead>Повреждения</TableHead>
                        <TableHead>Состояние</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Нет данных о растениях
                          </TableCell>
                        </TableRow>
                      ) : (
                        plants.map((plant) => (
                          <TableRow key={plant.id}>
                            <TableCell className="text-2xl">
                              {plant.type === 'tree' ? '🌳' : '🌿'}
                            </TableCell>
                            <TableCell className="font-medium">{plant.species}</TableCell>
                            <TableCell>{plant.age} лет</TableCell>
                            <TableCell>{plant.height} м</TableCell>
                            <TableCell>{plant.crownDiameter} м</TableCell>
                            <TableCell className="max-w-[200px] truncate">{plant.damages || '—'}</TableCell>
                            <TableCell>
                              <Badge variant={getHealthStatusVariant(plant.healthStatus)}>
                                {getHealthStatusLabel(plant.healthStatus)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lawns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Газоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>№</TableHead>
                        <TableHead>Тип травы</TableHead>
                        <TableHead>Площадь</TableHead>
                        <TableHead>Количество точек</TableHead>
                        <TableHead>Состояние</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lawns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Нет данных о газонах
                          </TableCell>
                        </TableRow>
                      ) : (
                        lawns.map((lawn, index) => (
                          <TableRow key={lawn.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{lawn.grassType}</TableCell>
                            <TableCell>{lawn.area} м²</TableCell>
                            <TableCell>{lawn.positions.length} точек</TableCell>
                            <TableCell>
                              <Badge variant={getHealthStatusVariant(lawn.healthStatus)}>
                                {getHealthStatusLabel(lawn.healthStatus)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TablePage;