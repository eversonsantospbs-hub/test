"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters } from '@/types';
import { formatDate, isSameDay, isAfter, isBefore, isEqual } from '@/lib/dateUtils';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

// Importação dinâmica para evitar problemas de SSR
const generatePDF = async () => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');
  return jsPDF;
};

interface RelatoriosPDFProps {
  filters: DashboardFilters;
}

export function RelatoriosPDF({ filters }: RelatoriosPDFProps) {
  const { agendamentos, funcionarias, servicos } = useAppData();

  const gerarRelatorioPDF = async () => {
    try {
      const jsPDF = await generatePDF();
      
      // Filtrar agendamentos baseado nos filtros
      const agendamentosFiltrados = agendamentos.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.dataHora);
        
        if (filters.status && filters.status !== 'todos' && agendamento.status !== filters.status) {
          return false;
        }

        const hoje = new Date();
        let dataInicio: Date;
        let dataFim: Date = hoje;

        switch (filters.periodo) {
          case 'hoje':
            return isSameDay(dataAgendamento, hoje);
          case 'semana':
            dataInicio = new Date(hoje);
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case 'mes':
            dataInicio = new Date(hoje);
            dataInicio.setMonth(hoje.getMonth() - 1);
            break;
          case 'personalizado':
            if (filters.dataInicio && filters.dataFim) {
              dataInicio = filters.dataInicio;
              dataFim = filters.dataFim;
            } else {
              return true;
            }
            break;
          default:
            return true;
        }

        return (isAfter(dataAgendamento, dataInicio) || isEqual(dataAgendamento, dataInicio)) &&
               (isBefore(dataAgendamento, dataFim) || isEqual(dataAgendamento, dataFim));
      });

      // Calcular métricas
      const agendamentosConcluidos = agendamentosFiltrados.filter(a => a.status === 'concluido');
      const faturamentoTotal = agendamentosConcluidos.reduce((total, a) => total + a.preco, 0);
      const ticketMedio = agendamentosConcluidos.length > 0 ? faturamentoTotal / agendamentosConcluidos.length : 0;
      const taxaComparecimento = agendamentosFiltrados.length > 0 
        ? (agendamentosConcluidos.length / agendamentosFiltrados.length) * 100 
        : 0;

      // Criar PDF
      const doc = new jsPDF();
      
      // Configurar fonte
      doc.setFont('helvetica');
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(236, 72, 153); // Rosa
      doc.text('✨ Só Elas Studio', 20, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Gestão', 20, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 45);
      doc.text(`Período: ${getPeriodoTexto()}`, 20, 52);

      // Métricas principais
      let yPosition = 70;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('📊 Métricas Principais', 20, yPosition);
      
      yPosition += 15;
      doc.setFontSize(10);
      
      // Caixas de métricas
      const metricas = [
        { label: 'Faturamento Total', valor: `R$ ${faturamentoTotal.toFixed(2)}` },
        { label: 'Agendamentos Concluídos', valor: agendamentosConcluidos.length.toString() },
        { label: 'Ticket Médio', valor: `R$ ${ticketMedio.toFixed(2)}` },
        { label: 'Taxa de Comparecimento', valor: `${taxaComparecimento.toFixed(1)}%` }
      ];

      metricas.forEach((metrica, index) => {
        const x = 20 + (index % 2) * 90;
        const y = yPosition + Math.floor(index / 2) * 25;
        
        // Desenhar caixa
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y - 5, 80, 20);
        
        // Texto
        doc.setFontSize(12);
        doc.setTextColor(236, 72, 153);
        doc.text(metrica.valor, x + 5, y + 3);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(metrica.label, x + 5, y + 10);
      });

      yPosition += 60;

      // Tabela de agendamentos
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('📅 Agendamentos do Período', 20, yPosition);
      
      yPosition += 10;

      // Preparar dados da tabela
      const tableData = agendamentosFiltrados.map(agendamento => {
        const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
        const servico = servicos.find(s => s.id === agendamento.servicoId);
        const statusTexto = agendamento.status === 'agendado' ? 'Agendado' :
                           agendamento.status === 'concluido' ? 'Concluído' : 'Não Compareceu';
        
        return [
          formatDate(new Date(agendamento.dataHora), 'dd/MM/yyyy'),
          formatDate(new Date(agendamento.dataHora), 'HH:mm'),
          agendamento.clienteNome,
          funcionaria?.nome || 'N/A',
          servico?.nome || 'N/A',
          `R$ ${agendamento.preco.toFixed(2)}`,
          statusTexto
        ];
      });

      // Criar tabela usando autoTable
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Data', 'Hora', 'Cliente', 'Funcionária', 'Serviço', 'Valor', 'Status']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [236, 72, 153],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Nova página se necessário
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
      
      if (finalY > 250) {
        doc.addPage();
        yPosition = 30;
      } else {
        yPosition = finalY + 20;
      }

      // Tabela de funcionárias
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('👥 Performance da Equipe', 20, yPosition);
      
      yPosition += 10;

      const funcionariasData = funcionarias.map(funcionaria => {
        const agendamentosFuncionaria = agendamentosFiltrados.filter(a => a.funcionariaId === funcionaria.id && a.status === 'concluido');
        const faturamentoFuncionaria = agendamentosFuncionaria.reduce((total, a) => total + a.preco, 0);
        
        return [
          `${funcionaria.nome} ${funcionaria.isDona ? '👑' : ''}`,
          funcionaria.cargo,
          agendamentosFuncionaria.length.toString(),
          `R$ ${faturamentoFuncionaria.toFixed(2)}`
        ];
      });

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Nome', 'Cargo', 'Agendamentos', 'Faturamento']],
        body: funcionariasData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [236, 72, 153],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Relatório gerado pelo Sistema Só Elas Studio', 20, 285);
        doc.text(`Página ${i} de ${pageCount}`, 170, 285);
      }

      // Salvar PDF
      const nomeArquivo = `relatorio-soelas-${formatDate(new Date(), 'dd-MM-yyyy')}.pdf`;
      doc.save(nomeArquivo);
      
      toast.success('Relatório PDF baixado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório PDF. Tente novamente.');
    }
  };

  const gerarRelatorioResumido = async () => {
    try {
      const jsPDF = await generatePDF();
      
      // Filtrar agendamentos
      const agendamentosFiltrados = agendamentos.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.dataHora);
        
        if (filters.status && filters.status !== 'todos' && agendamento.status !== filters.status) {
          return false;
        }

        const hoje = new Date();
        let dataInicio: Date;
        let dataFim: Date = hoje;

        switch (filters.periodo) {
          case 'hoje':
            return isSameDay(dataAgendamento, hoje);
          case 'semana':
            dataInicio = new Date(hoje);
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case 'mes':
            dataInicio = new Date(hoje);
            dataInicio.setMonth(hoje.getMonth() - 1);
            break;
          case 'personalizado':
            if (filters.dataInicio && filters.dataFim) {
              dataInicio = filters.dataInicio;
              dataFim = filters.dataFim;
            } else {
              return true;
            }
            break;
          default:
            return true;
        }

        return (isAfter(dataAgendamento, dataInicio) || isEqual(dataAgendamento, dataInicio)) &&
               (isBefore(dataAgendamento, dataFim) || isEqual(dataAgendamento, dataFim));
      });

      // Calcular métricas
      const agendamentosConcluidos = agendamentosFiltrados.filter(a => a.status === 'concluido');
      const faturamentoTotal = agendamentosConcluidos.reduce((total, a) => total + a.preco, 0);
      const ticketMedio = agendamentosConcluidos.length > 0 ? faturamentoTotal / agendamentosConcluidos.length : 0;
      const taxaComparecimento = agendamentosFiltrados.length > 0 
        ? (agendamentosConcluidos.length / agendamentosFiltrados.length) * 100 
        : 0;

      // Criar PDF resumido
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFont('helvetica');
      doc.setFontSize(20);
      doc.setTextColor(236, 72, 153);
      doc.text('✨ Só Elas Studio', 20, 25);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório Resumido', 20, 40);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${getPeriodoTexto()}`, 20, 50);
      doc.text(`Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 57);

      // Métricas em destaque
      let yPosition = 80;
      
      const metricas = [
        { label: 'Faturamento Total', valor: `R$ ${faturamentoTotal.toFixed(2)}`, cor: [34, 197, 94] },
        { label: 'Agendamentos Concluídos', valor: agendamentosConcluidos.length.toString(), cor: [59, 130, 246] },
        { label: 'Ticket Médio', valor: `R$ ${ticketMedio.toFixed(2)}`, cor: [168, 85, 247] },
        { label: 'Taxa de Comparecimento', valor: `${taxaComparecimento.toFixed(1)}%`, cor: [236, 72, 153] }
      ];

      metricas.forEach((metrica, index) => {
        const y = yPosition + index * 35;
        
        // Caixa colorida
        doc.setFillColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
        doc.rect(20, y - 10, 150, 25, 'F');
        
        // Texto branco
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(metrica.valor, 25, y + 2);
        
        doc.setFontSize(10);
        doc.text(metrica.label, 25, y + 10);
      });

      // Resumo por funcionária
      yPosition += 160;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('👥 Top Funcionárias', 20, yPosition);
      
      const funcionariasComFaturamento = funcionarias.map(funcionaria => {
        const agendamentosFuncionaria = agendamentosFiltrados.filter(a => a.funcionariaId === funcionaria.id && a.status === 'concluido');
        const faturamentoFuncionaria = agendamentosFuncionaria.reduce((total, a) => total + a.preco, 0);
        
        return {
          nome: funcionaria.nome,
          faturamento: faturamentoFuncionaria,
          agendamentos: agendamentosFuncionaria.length
        };
      }).sort((a, b) => b.faturamento - a.faturamento);

      yPosition += 15;
      
      funcionariasComFaturamento.slice(0, 3).forEach((funcionaria, index) => {
        const y = yPosition + index * 15;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${funcionaria.nome}`, 25, y);
        doc.text(`R$ ${funcionaria.faturamento.toFixed(2)} (${funcionaria.agendamentos} agendamentos)`, 25, y + 7);
      });

      // Salvar PDF
      const nomeArquivo = `relatorio-resumido-soelas-${formatDate(new Date(), 'dd-MM-yyyy')}.pdf`;
      doc.save(nomeArquivo);
      
      toast.success('Relatório resumido baixado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF resumido:', error);
      toast.error('Erro ao gerar relatório resumido. Tente novamente.');
    }
  };

  const getPeriodoTexto = () => {
    switch (filters.periodo) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Últimos 7 dias';
      case 'mes': return 'Último mês';
      case 'personalizado': 
        if (filters.dataInicio && filters.dataFim) {
          return `${formatDate(filters.dataInicio, 'dd/MM/yyyy')} a ${formatDate(filters.dataFim, 'dd/MM/yyyy')}`;
        }
        return 'Período personalizado';
      default: return 'Todos os períodos';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Relatórios em PDF</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Baixe relatórios completos em PDF com todas as informações do período selecionado.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={gerarRelatorioPDF}
              className="bg-red-600 hover:bg-red-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório Completo PDF
            </Button>
            
            <Button 
              variant="outline"
              onClick={gerarRelatorioResumido}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Relatório Resumido PDF
            </Button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>✅ Funciona em:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Navegadores web (Chrome, Firefox, Safari)</li>
              <li>Aplicativo Android (WebView)</li>
              <li>Dispositivos móveis (iOS/Android)</li>
              <li>Download automático do arquivo PDF</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}