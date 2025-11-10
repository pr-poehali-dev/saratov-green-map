import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  address?: string;
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
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tree' | 'bush'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'satisfactory' | 'unsatisfactory'>('all');
  const [lawnStatusFilter, setLawnStatusFilter] = useState<'all' | 'healthy' | 'satisfactory' | 'unsatisfactory'>('all');
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
        
        loadAddresses(plantsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    loadData();
  }, []);

  const loadAddresses = async (plantsData: PlantData[]) => {
    setLoadingAddresses(true);
    const plantsWithAddresses = await Promise.all(
      plantsData.map(async (plant) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${plant.position[0]}&lon=${plant.position[1]}&accept-language=ru`
          );
          const data = await response.json();
          return {
            ...plant,
            address: data.display_name || 'Адрес не найден'
          };
        } catch (error) {
          console.error('Ошибка геокодирования:', error);
          return {
            ...plant,
            address: 'Ошибка загрузки адреса'
          };
        }
      })
    );
    setPlants(plantsWithAddresses);
    setLoadingAddresses(false);
  };

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = 
        plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plant.address && plant.address.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || plant.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || plant.healthStatus === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [plants, searchQuery, typeFilter, statusFilter]);

  const filteredLawns = useMemo(() => {
    return lawns.filter(lawn => {
      const matchesStatus = lawnStatusFilter === 'all' || lawn.healthStatus === lawnStatusFilter;
      return matchesStatus;
    });
  }, [lawns, lawnStatusFilter]);

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
              Растения ({filteredPlants.length}/{plants.length})
            </TabsTrigger>
            <TabsTrigger value="lawns" className="flex items-center gap-2">
              <Icon name="Square" size={16} />
              Газоны ({filteredLawns.length}/{lawns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Деревья и кустарники</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по виду или адресу..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Тип растения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="tree">Деревья</SelectItem>
                      <SelectItem value="bush">Кустарники</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все состояния</SelectItem>
                      <SelectItem value="healthy">Здоровое</SelectItem>
                      <SelectItem value="satisfactory">Удовлетворительное</SelectItem>
                      <SelectItem value="unsatisfactory">Неудовлетворительное</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setStatusFilter('all');
                      }}
                      className="whitespace-nowrap"
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Тип</TableHead>
                        <TableHead>Вид растения</TableHead>
                        <TableHead>Адрес</TableHead>
                        <TableHead>Возраст</TableHead>
                        <TableHead>Высота</TableHead>
                        <TableHead>Диаметр кроны</TableHead>
                        <TableHead>Повреждения</TableHead>
                        <TableHead>Состояние</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            {plants.length === 0 ? 'Нет данных о растениях' : 'Растения не найдены'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPlants.map((plant) => (
                          <TableRow key={plant.id}>
                            <TableCell className="text-2xl">
                              {plant.type === 'tree' ? '🌳' : '🌿'}
                            </TableCell>
                            <TableCell className="font-medium">{plant.species}</TableCell>
                            <TableCell className="max-w-[300px]">
                              {loadingAddresses ? (
                                <span className="text-muted-foreground text-sm">Загрузка...</span>
                              ) : (
                                <span className="text-sm">{plant.address || '—'}</span>
                              )}
                            </TableCell>
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
                <div className="flex gap-4 mb-6">
                  <Select value={lawnStatusFilter} onValueChange={(value) => setLawnStatusFilter(value as any)}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все состояния</SelectItem>
                      <SelectItem value="healthy">Здоровое</SelectItem>
                      <SelectItem value="satisfactory">Удовлетворительное</SelectItem>
                      <SelectItem value="unsatisfactory">Неудовлетворительное</SelectItem>
                    </SelectContent>
                  </Select>
                  {lawnStatusFilter !== 'all' && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setLawnStatusFilter('all')}
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Сбросить
                    </Button>
                  )}
                </div>
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
                      {filteredLawns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {lawns.length === 0 ? 'Нет данных о газонах' : 'Газоны не найдены'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLawns.map((lawn, index) => (
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