import { useState } from 'react';
import HomeScreenContent from '../components/home/HomeScreenContent';
import MainTabLayout from '../components/layout/MainTabLayout';
import { Cidade, cidadesRecomendadas, ultimasVisualizadas } from '../data/mockCidades';

export default function HomeScreen() {
  const [busca, setBusca] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<Cidade[] | null>(null);

  function handleBusca() {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      setResultadoBusca(null);
      return;
    }
    const todas = [...cidadesRecomendadas, ...ultimasVisualizadas];
    setResultadoBusca(todas.filter((c) => c.nome.toLowerCase().includes(termo)));
  }

  return (
    <MainTabLayout activeTab="explorar">
      <HomeScreenContent
        busca={busca}
        resultadoBusca={resultadoBusca}
        recomendadas={cidadesRecomendadas}
        ultimas={ultimasVisualizadas}
        onChangeBusca={(t) => {
          setBusca(t);
          if (!t.trim()) setResultadoBusca(null);
        }}
        onSubmitBusca={handleBusca}
      />
    </MainTabLayout>
  );
}
