"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Produto } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface ListaProdutosProps {
  onEditProduto: (produto: Produto) => void;
  onNovoProduto: () => void;
  onAdicionarEstoque: (produto: Produto) => void;
}

export function ListaProdutos({ 
  onEditProduto, 
  onNovoProduto, 
  onAdicionarEstoque 
}: ListaProdutosProps) {
  const { produtos, excluirProduto } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar produtos baseado na busca
  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar produtos com estoque baixo
  const produtosEstoqueBaixo = produtosFiltrados.filter(
    produto => produto.quantidadeAtual <= produto.estoqueMinimo
  );

  const handleExcluirProduto = (produtoId: string) => {
    excluirProduto(produtoId);
    toast.success('Produto excluído com sucesso!');
  };

  const calcularValorTotal = (produto: Produto) => {
    return produto.quantidadeAtual * produto.custoUnitario;
  };

  const valorTotalEstoque = produtosFiltrados.reduce(
    (total, produto) => total + calcularValorTotal(produto), 
    0
  );

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold">{produtos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">{produtosEstoqueBaixo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {valorTotalEstoque.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de estoque baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Produtos com Estoque Baixo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {produtosEstoqueBaixo.map((produto) => (
                <Badge key={produto.id} variant="destructive" className="justify-start">
                  {produto.nome} - {produto.quantidadeAtual} {produto.unidade}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Gestão de Produtos</span>
            </CardTitle>
            <Button onClick={onNovoProduto} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de produtos */}
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto/Marca</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Unidade</TableHead>
                    <TableHead className="text-center">Estoque Mín.</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => {
                    const isEstoqueBaixo = produto.quantidadeAtual <= produto.estoqueMinimo;
                    
                    return (
                      <TableRow 
                        key={produto.id}
                        className={cn(
                          isEstoqueBaixo && "bg-red-50 border-red-200"
                        )}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{produto.nome}</div>
                            <div className="text-sm text-gray-500">{produto.marca}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-semibold",
                            isEstoqueBaixo && "text-red-600"
                          )}>
                            {produto.quantidadeAtual}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{produto.unidade}</TableCell>
                        <TableCell className="text-center">{produto.estoqueMinimo}</TableCell>
                        <TableCell className="text-right">
                          R$ {produto.custoUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {calcularValorTotal(produto).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAdicionarEstoque(produto)}
                              title="Adicionar Estoque"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEditProduto(produto)}
                              title="Editar Produto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o produto "{produto.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleExcluirProduto(produto.id)}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}