"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ListaProdutos } from '@/components/Estoque/ListaProdutos';
import { FormularioProduto } from '@/components/Estoque/FormularioProduto';
import { FormularioCompra } from '@/components/Estoque/FormularioCompra';
import { RelatorioCompras } from '@/components/Estoque/RelatorioCompras';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Produto } from '@/types';
import { Package, FileText } from 'lucide-react';

export default function EstoquePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [showFormularioProduto, setShowFormularioProduto] = useState(false);
  const [showFormularioCompra, setShowFormularioCompra] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState<Produto | undefined>();
  const [produtoCompra, setProdutoCompra] = useState<Produto | undefined>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNovoProduto = () => {
    setProdutoEdit(undefined);
    setShowFormularioProduto(true);
  };

  const handleEditProduto = (produto: Produto) => {
    setProdutoEdit(produto);
    setShowFormularioProduto(true);
  };

  const handleAdicionarEstoque = (produto: Produto) => {
    setProdutoCompra(produto);
    setShowFormularioCompra(true);
  };

  const handleCloseFormularioProduto = () => {
    setShowFormularioProduto(false);
    setProdutoEdit(undefined);
  };

  const handleCloseFormularioCompra = () => {
    setShowFormularioCompra(false);
    setProdutoCompra(undefined);
  };

  return (
    <AppLayout title="Estoque">
      <div className="space-y-6">
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Relatório de Compras</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="mt-6">
            <ListaProdutos
              onEditProduto={handleEditProduto}
              onNovoProduto={handleNovoProduto}
              onAdicionarEstoque={handleAdicionarEstoque}
            />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatorioCompras />
          </TabsContent>
        </Tabs>

        {/* Modais */}
        <FormularioProduto
          isOpen={showFormularioProduto}
          onClose={handleCloseFormularioProduto}
          produto={produtoEdit}
        />

        <FormularioCompra
          isOpen={showFormularioCompra}
          onClose={handleCloseFormularioCompra}
          produto={produtoCompra}
        />
      </div>
    </AppLayout>
  );
}