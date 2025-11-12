"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Funcionaria } from '@/types';
import { toast } from 'sonner';

const funcionariaSchema = z.object({
  nome: z.string().min(1, 'Nome da funcionária é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório')
});

type FuncionariaFormData = z.infer<typeof funcionariaSchema>;

interface FormularioFuncionariaProps {
  isOpen: boolean;
  onClose: () => void;
  funcionaria?: Funcionaria;
}

const cargosSugeridos = [
  'Cabeleireira',
  'Manicure',
  'Pedicure',
  'Esteticista',
  'Maquiadora',
  'Massagista',
  'Recepcionista',
  'Auxiliar',
  'Gerente'
];

export function FormularioFuncionaria({
  isOpen,
  onClose,
  funcionaria
}: FormularioFuncionariaProps) {
  const { adicionarFuncionaria, editarFuncionaria } = useAppData();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FuncionariaFormData>({
    resolver: zodResolver(funcionariaSchema)
  });

  // Preencher formulário quando funcionária for passada
  useEffect(() => {
    if (funcionaria) {
      reset({
        nome: funcionaria.nome,
        cargo: funcionaria.cargo
      });
    } else {
      reset({
        nome: '',
        cargo: ''
      });
    }
  }, [funcionaria, reset]);

  const onSubmit = async (data: FuncionariaFormData) => {
    try {
      const novaFuncionaria: Omit<Funcionaria, 'id'> = {
        nome: data.nome,
        cargo: data.cargo,
        isDona: funcionaria?.isDona || false
      };

      if (funcionaria) {
        // Editar funcionária existente
        editarFuncionaria(funcionaria.id, novaFuncionaria);
        toast.success('Funcionária atualizada com sucesso!');
      } else {
        // Criar nova funcionária
        adicionarFuncionaria(novaFuncionaria);
        toast.success('Funcionária criada com sucesso!');
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao salvar funcionária. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {funcionaria ? 'Editar Funcionária' : 'Nova Funcionária'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              {...register('nome')}
              className={errors.nome ? 'border-red-500' : ''}
              placeholder="Ex: Maria Silva"
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              {...register('cargo')}
              className={errors.cargo ? 'border-red-500' : ''}
              placeholder="Ex: Cabeleireira"
              list="cargos-sugeridos"
            />
            <datalist id="cargos-sugeridos">
              {cargosSugeridos.map((cargo) => (
                <option key={cargo} value={cargo} />
              ))}
            </datalist>
            {errors.cargo && (
              <p className="text-sm text-red-500">{errors.cargo.message}</p>
            )}
          </div>

          {/* Sugestões de cargos */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Sugestões de cargos:</Label>
            <div className="flex flex-wrap gap-2">
              {cargosSugeridos.map((cargo) => (
                <Button
                  key={cargo}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('cargo', cargo)}
                  className="text-xs"
                >
                  {cargo}
                </Button>
              ))}
            </div>
          </div>

          {funcionaria?.isDona && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta é a proprietária do salão. O status de proprietária não pode ser alterado.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isSubmitting ? 'Salvando...' : (funcionaria ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}