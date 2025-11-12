"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Servico } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface ListaServicosProps {
  onEditServico: (servico: Servico) => void;
  onNovoServico: () => void;
}

export function ListaServicos({ 
  onEditServico, 
  onNovoServico 
}: ListaServicosProps) {
  const { servicos, excluirServico } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar serviços baseado na busca
  const servicosFiltrados = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExcluirServico = (servicoId: string) => {
    excluirServico(servicoId);
    toast.success('Serviço excluído com sucesso!');
  };

  // Calcular estatísticas
  const precoMedio = servicos.length > 0 
    ? servicos.reduce((total, servico) => total + servico.precoBase, 0) / servicos.length 
    : 0;

  const duracaoMedia = servicos.length > 0
    ? servicos.reduce((total, servico) => total + servico.duracaoMinutos, 0) / servicos.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Serviços</p>
                <p className="text-2xl font-bold">{servicos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {precoMedio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Duração Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(duracaoMedia)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de serviços */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Serviços Oferecidos</span>
            </CardTitle>
            <Button onClick={onNovoServico} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de serviços */}
          {servicosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Serviço</TableHead>
                    <TableHead className="text-right">Preço Padrão</TableHead>
                    <TableHead className="text-center">Duração</TableHead>
                    <TableHead className="text-center">Cor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicosFiltrados.map((servico) => (
                    <TableRow key={servico.id}>
                      <TableCell>
                        <div className="font-medium">{servico.nome}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {servico.precoBase.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="flex items-center space-x-1 w-fit mx-auto">
                          <Clock className="h-3 w-3" />
                          <span>{servico.duracaoMinutos} min</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: servico.corPadrao }}
                            title={servico.corPadrao}
                          />
                          <span className="text-xs text-gray-500 font-mono">
                            {servico.corPadrao}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditServico(servico)}
                            title="Editar Serviço"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Excluir Serviço"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o serviço "{servico.nome}"?
                                  Esta ação não pode ser desfeita e pode afetar agendamentos existentes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleExcluirServico(servico.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}