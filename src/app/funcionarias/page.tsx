"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ListaFuncionarias } from '@/components/Funcionarias/ListaFuncionarias';
import { FormularioFuncionaria } from '@/components/Funcionarias/FormularioFuncionaria';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Funcionaria } from '@/types';

export default function FuncionariasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [showFormulario, setShowFormulario] = useState(false);
  const [funcionariaEdit, setFuncionariaEdit] = useState<Funcionaria | undefined>();

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

  const handleNovaFuncionaria = () => {
    setFuncionariaEdit(undefined);
    setShowFormulario(true);
  };

  const handleEditFuncionaria = (funcionaria: Funcionaria) => {
    setFuncionariaEdit(funcionaria);
    setShowFormulario(true);
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
    setFuncionariaEdit(undefined);
  };

  return (
    <AppLayout title="Funcionárias">
      <div className="space-y-6">
        <ListaFuncionarias
          onEditFuncionaria={handleEditFuncionaria}
          onNovaFuncionaria={handleNovaFuncionaria}
        />

        <FormularioFuncionaria
          isOpen={showFormulario}
          onClose={handleCloseFormulario}
          funcionaria={funcionariaEdit}
        />
      </div>
    </AppLayout>
  );
}