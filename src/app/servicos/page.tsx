"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ListaServicos } from '@/components/Servicos/ListaServicos';
import { FormularioServico } from '@/components/Servicos/FormularioServico';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Servico } from '@/types';

export default function ServicosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [showFormulario, setShowFormulario] = useState(false);
  const [servicoEdit, setServicoEdit] = useState<Servico | undefined>();

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

  const handleNovoServico = () => {
    setServicoEdit(undefined);
    setShowFormulario(true);
  };

  const handleEditServico = (servico: Servico) => {
    setServicoEdit(servico);
    setShowFormulario(true);
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
    setServicoEdit(undefined);
  };

  return (
    <AppLayout title="Serviços">
      <div className="space-y-6">
        <ListaServicos
          onEditServico={handleEditServico}
          onNovoServico={handleNovoServico}
        />

        <FormularioServico
          isOpen={showFormulario}
          onClose={handleCloseFormulario}
          servico={servicoEdit}
        />
      </div>
    </AppLayout>
  );
}