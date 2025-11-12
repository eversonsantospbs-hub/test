"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppData } from '@/contexts/AppDataContext';
import { formatDate } from '@/lib/dateUtils';
import { FileDown, Calendar, DollarSign, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'personalizado';

export function RelatorioCompras() {
  const { registrosCompra, produtos } = useAppData();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Calcular datas baseadas no período selecionado
  const getDatasFiltragem = () => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date = hoje;

    switch (periodo) {
      case 'hoje':
        inicio = new Date(hoje);
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        inicio = new Date(hoje);
        
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'personalizado':
        if (dataInicio && dataFim) {
          inicio = new Date(dataInicio);
          fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
        } else {
          inicio = new Date(hoje);
          inicio.setMonth(hoje.getMonth() - 1);
        }
        break;
      default:
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 1);
    }

    return { inicio, fim };
  };

  // Filtrar registros baseado no período
  const registrosFiltrados = useMemo(() => {
    const { inicio, fim } = getDatasFiltragem();
    
    return registrosCompra.filter(registro => {
      const dataRegistro = new Date(registro.dataCompra);
      return dataRegistro >= inicio && dataRegistro <= fim;
    }).sort((a, b) => new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime());
  }, [registrosCompra, periodo, dataInicio, dataFim]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const totalGasto = registrosFiltrados.reduce((total, registro) => total + registro.valorTotal, 0);
    const totalItens = registrosFiltrados.reduce((total, registro) => total + registro.quantidade, 0);
    const numeroCompras = registrosFiltrados.length;
    const ticketMedio = numeroCompras > 0 ? totalGasto / numeroCompras : 0;

    return {
      totalGasto,
      totalItens,
      numeroCompras,
      ticketMedio
    };
  }, [registrosFiltrados]);

  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Relatório de Compras - Só Elas Studio', 20, 20);
      
      // Período
      const { inicio, fim } = getDatasFiltragem();
      doc.setFontSize(12);
      doc.text(`Período: ${formatDate(inicio, 'dd/MM/yyyy')} a ${formatDate(fim, 'dd/MM/yyyy')}`, 20, 35);
      
      // Estatísticas
      doc.text(`Total Gasto: R$ ${estatisticas.totalGasto.toFixed(2)}`, 20, 50);
      doc.text(`Número de Compras: ${estatisticas.numeroCompras}`, 20, 60);
      doc.text(`Ticket Médio: R$ ${estatisticas.ticketMedio.toFixed(2)}`, 20, 70);
      
      // Tabela
      const tableData = registrosFiltrados.map(registro => {
        const produto = produtos.find(p => p.id === registro.produtoId);
        return [
          formatDate(new Date(registro.dataCompra), 'dd/MM/yyyy'),
          produto ? `${produto.nome} - ${produto.marca}` : 'Produto não encontrado',
          registro.quantidade.toString(),
          `R$ ${registro.custoUnitario.toFixed(2)}`,
          `R$ ${registro.valorTotal.toFixed(2)}`
        ];
      });

      doc.autoTable({
        head: [['Data', 'Produto', 'Quantidade', 'Custo Unit.', 'Total']],
        body: tableData,
        startY: 85,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [219, 39, 119] } // Pink color
      });

      doc.save(`relatorio-compras-${formatDate(new Date(), 'dd-MM-yyyy')}.pdf`);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório. Tente novamente.');
    }
  };

  const getPeriodoLabel = () => {
    switch (periodo) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Últimos 7 dias';
      case 'mes': return 'Último mês';
      case 'personalizado': return 'Período personalizado';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={periodo} onValueChange={(value: PeriodoFiltro) => setPeriodo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Último mês</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodo === 'personalizado' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button onClick={exportarPDF} className="bg-pink-600 hover:bg-pink-700">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {estatisticas.totalGasto.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Nº de Compras</p>
                <p className="text-2xl font-bold">{estatisticas.numeroCompras}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {estatisticas.ticketMedio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.totalItens}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros de Compras - {getPeriodoLabel()}</span>
            <span className="text-sm font-normal text-gray-500">
              {registrosFiltrados.length} registro(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma compra registrada no período selecionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosFiltrados.map((registro) => {
                    const produto = produtos.find(p => p.id === registro.produtoId);
                    
                    return (
                      <TableRow key={registro.id}>
                        <TableCell>
                          {formatDate(new Date(registro.dataCompra), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {produto ? (
                            <div>
                              <div className="font-medium">{produto.nome}</div>
                              <div className="text-sm text-gray-500">{produto.marca}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Produto não encontrado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {registro.quantidade} {produto?.unidade || ''}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {registro.custoUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {registro.valorTotal.toFixed(2)}
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