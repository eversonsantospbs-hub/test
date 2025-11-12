"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Funcionaria } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ListaFuncionariasProps {
  onEditFuncionaria: (funcionaria: Funcionaria) => void;
  onNovaFuncionaria: () => void;
}

export function ListaFuncionarias({ 
  onEditFuncionaria, 
  onNovaFuncionaria 
}: ListaFuncionariasProps) {
  const { funcionarias, excluirFuncionaria } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar funcionárias baseado na busca
  const funcionariasFiltradas = funcionarias.filter(funcionaria =>
    funcionaria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionaria.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExcluirFuncionaria = (funcionariaId: string) => {
    const funcionaria = funcionarias.find(f => f.id === funcionariaId);
    
    if (funcionaria?.isDona) {
      toast.error('Não é possível excluir a proprietária do salão!');
      return;
    }

    excluirFuncionaria(funcionariaId);
    toast.success('Funcionária excluída com sucesso!');
  };

  // Separar dona das outras funcionárias
  const dona = funcionariasFiltradas.find(f => f.isDona);
  const outrasFunc = funcionariasFiltradas.filter(f => !f.isDona);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Funcionárias</p>
                <p className="text-2xl font-bold">{funcionarias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Funcionárias Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {funcionarias.filter(f => !f.isDona).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de funcionárias */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Equipe do Salão</span>
            </CardTitle>
            <Button onClick={onNovaFuncionaria} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Funcionária
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de funcionárias */}
          {funcionariasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma funcionária encontrada' : 'Nenhuma funcionária cadastrada'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mostrar dona primeiro */}
                  {dona && (
                    <TableRow className="bg-yellow-50 border-yellow-200">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{dona.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {dona.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-yellow-600 hover:bg-yellow-700">
                          Proprietária
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditFuncionaria(dona)}
                            title="Editar Funcionária"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="text-gray-400"
                            title="Proprietária não pode ser excluída"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Outras funcionárias */}
                  {outrasFunc.map((funcionaria) => (
                    <TableRow key={funcionaria.id}>
                      <TableCell>
                        <div className="font-medium">{funcionaria.nome}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {funcionaria.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditFuncionaria(funcionaria)}
                            title="Editar Funcionária"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Excluir Funcionária"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a funcionária "{funcionaria.nome}"?
                                  Esta ação não pode ser desfeita e pode afetar agendamentos existentes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleExcluirFuncionaria(funcionaria.id)}
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

          {/* Nota sobre a proprietária */}
          {dona && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">
                  A proprietária do salão não pode ser excluída do sistema.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}