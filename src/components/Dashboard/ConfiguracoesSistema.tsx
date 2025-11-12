"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppData } from '@/contexts/AppDataContext';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  AlertTriangle,
  CheckCircle,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';

export function ConfiguracoesSistema() {
  const { agendamentos, funcionarias, servicos, produtos, registrosCompra } = useAppData();
  const [configuracoes, setConfiguracoes] = useState({
    nomeSalao: 'Só Elas Studio',
    endereco: '',
    telefone: '',
    email: '',
    horarioFuncionamento: '07:00 - 20:00',
    diasFuncionamento: 'Segunda a Sábado',
    observacoes: ''
  });

  const exportarBackup = () => {
    try {
      const backup = {
        versao: '1.0',
        dataExportacao: new Date().toISOString(),
        dados: {
          agendamentos,
          funcionarias,
          servicos,
          produtos,
          registrosCompra,
          configuracoes
        }
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-salon-${formatDate(new Date(), 'dd-MM-yyyy-HH-mm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup. Tente novamente.');
    }
  };

  const importarBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        
        if (!backup.dados) {
          toast.error('Arquivo de backup inválido.');
          return;
        }

        // Confirmar importação
        if (window.confirm('⚠️ ATENÇÃO: Isso substituirá todos os dados atuais. Deseja continuar?')) {
          // Salvar dados no localStorage
          Object.entries(backup.dados).forEach(([key, value]) => {
            if (key !== 'configuracoes') {
              localStorage.setItem(key, JSON.stringify(value));
            }
          });

          if (backup.dados.configuracoes) {
            setConfiguracoes(backup.dados.configuracoes);
          }

          toast.success('Backup importado com sucesso! Recarregue a página.');
          
          // Recarregar página após 2 segundos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        toast.error('Erro ao importar backup. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const limparDados = () => {
    if (window.confirm('⚠️ ATENÇÃO: Isso apagará TODOS os dados do sistema. Esta ação não pode ser desfeita!')) {
      if (window.confirm('Tem certeza absoluta? Digite "CONFIRMAR" para prosseguir:')) {
        const confirmacao = prompt('Digite "CONFIRMAR" para apagar todos os dados:');
        if (confirmacao === 'CONFIRMAR') {
          // Limpar localStorage
          ['agendamentos', 'funcionarias', 'servicos', 'produtos', 'registrosCompra'].forEach(key => {
            localStorage.removeItem(key);
          });
          
          toast.success('Todos os dados foram apagados. Recarregando...');
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    }
  };

  const salvarConfiguracoes = () => {
    localStorage.setItem('configuracoesSalao', JSON.stringify(configuracoes));
    toast.success('Configurações salvas com sucesso!');
  };

  const estatisticasSistema = {
    totalAgendamentos: agendamentos.length,
    totalFuncionarias: funcionarias.length,
    totalServicos: servicos.length,
    totalProdutos: produtos.length,
    totalCompras: registrosCompra.length,
    tamanhoBackup: JSON.stringify({ agendamentos, funcionarias, servicos, produtos, registrosCompra }).length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações do Sistema</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estatísticas do Sistema */}
          <div>
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span>Estatísticas do Sistema</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-900">{estatisticasSistema.totalAgendamentos}</p>
                <p className="text-xs text-blue-600">Agendamentos</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-900">{estatisticasSistema.totalFuncionarias}</p>
                <p className="text-xs text-green-600">Funcionárias</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                <p className="text-2xl font-bold text-purple-900">{estatisticasSistema.totalServicos}</p>
                <p className="text-xs text-purple-600">Serviços</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
                <p className="text-2xl font-bold text-orange-900">{estatisticasSistema.totalProdutos}</p>
                <p className="text-xs text-orange-600">Produtos</p>
              </div>
              <div className="p-3 rounded-lg bg-pink-50 border border-pink-200 text-center">
                <p className="text-2xl font-bold text-pink-900">{estatisticasSistema.totalCompras}</p>
                <p className="text-xs text-pink-600">Compras</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-gray-900">{(estatisticasSistema.tamanhoBackup / 1024).toFixed(1)}KB</p>
                <p className="text-xs text-gray-600">Tamanho dos Dados</p>
              </div>
            </div>
          </div>

          {/* Configurações do Salão */}
          <div>
            <h4 className="font-medium mb-3">Informações do Salão</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeSalao">Nome do Salão</Label>
                <Input
                  id="nomeSalao"
                  value={configuracoes.nomeSalao}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, nomeSalao: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={configuracoes.telefone}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={configuracoes.email}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@soelastudio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horário de Funcionamento</Label>
                <Input
                  id="horario"
                  value={configuracoes.horarioFuncionamento}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, horarioFuncionamento: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={configuracoes.endereco}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua das Flores, 123 - Centro"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={configuracoes.observacoes}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais sobre o salão..."
                  rows={3}
                />
              </div>
            </div>
            <Button onClick={salvarConfiguracoes} className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>

          {/* Backup e Restauração */}
          <div>
            <h4 className="font-medium mb-3">Backup e Restauração</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={exportarBackup} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar Backup
              </Button>
              
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importarBackup}
                  className="hidden"
                  id="importBackup"
                />
                <Button 
                  onClick={() => document.getElementById('importBackup')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Backup
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Importante sobre Backups:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Faça backups regulares dos seus dados</li>
                    <li>O backup inclui todos os agendamentos, funcionárias, serviços e produtos</li>
                    <li>Importar um backup substituirá todos os dados atuais</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div>
            <h4 className="font-medium mb-3 text-red-600">Zona de Perigo</h4>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start space-x-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Apagar Todos os Dados</p>
                  <p>Esta ação removerá permanentemente todos os agendamentos, funcionárias, serviços e produtos. Esta ação não pode ser desfeita!</p>
                </div>
              </div>
              <Button 
                onClick={limparDados}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Apagar Todos os Dados
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}