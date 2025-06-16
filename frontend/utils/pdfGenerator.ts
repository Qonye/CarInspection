import { CarInspection } from '../types/inspection';
import { getRecommendation, getRatingText, getRatingColor } from './reportRecommendations';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generatePDF = async (inspection: CarInspection): Promise<Blob> => {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper functions
  const addHeading = (text: string) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += 10;
  };

  const addSubheading = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addText = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(text, margin, yPos);
    yPos += 6;
  };

  const addSpacer = () => {
    yPos += 10;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = 'Vehicle Inspection Report';
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Basic Information
  addHeading('Vehicle Information');
  const carInfo = [
    ['Make:', inspection.carBasics?.make || 'N/A'],
    ['Model:', inspection.carBasics?.model || 'N/A'],
    ['Year:', inspection.carBasics?.manufactureYear?.toString() || 'N/A'],
    ['VIN/Chassis:', inspection.carBasics?.chassisNumber || 'N/A'],
    ['Engine:', inspection.carBasics?.engineNumber || 'N/A'],
    ['Registration:', inspection.carBasics?.registrationNumber || 'N/A'],
    ['Mileage:', `${inspection.carBasics?.mileage || 'N/A'} ${inspection.carBasics?.mileageUnit || ''}`]
  ];

  doc.autoTable({
    startY: yPos,
    margin: { left: margin },
    body: carInfo,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 100 }
    }
  } as UserOptions);

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Inspector Information
  checkPageBreak(40);
  addHeading('Inspector Information');
  const inspectorInfo = [
    ['Name:', inspection.inspector?.name || 'N/A'],
    ['Company:', inspection.inspector?.company || 'N/A']
  ];

  doc.autoTable({
    startY: yPos,
    margin: { left: margin },
    body: inspectorInfo,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 100 }
    }
  } as UserOptions);

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Inspection Results
  const addInspectionSection = (title: string, data: any, isChecklist = false) => {
    checkPageBreak(60);
    addHeading(title);

    if (isChecklist) {
      const checklistData = Object.entries(data || {}).map(([key, value]: [string, any]) => [
        key.replace(/([A-Z])/g, ' $1').trim(),
        value?.checked ? '✓' : '✗',
        value?.notes || ''
      ]);

      if (checklistData.length > 0) {
        doc.autoTable({
          startY: yPos,
          margin: { left: margin },
          head: [['Item', 'Status', 'Notes']],
          body: checklistData,
          theme: 'striped',
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 20 },
            2: { cellWidth: 70 }
          }
        } as UserOptions);
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
    } else {
      const ratingData = Object.entries(data || {}).map(([key, value]: [string, any]) => {
        if (typeof value === 'object' && 'score' in value) {
          return [
            key.replace(/([A-Z])/g, ' $1').trim(),
            getRatingText(value.score),
            value.notes || ''
          ];
        }
        return null;
      }).filter(item => item !== null);

      if (ratingData.length > 0) {
        doc.autoTable({
          startY: yPos,
          margin: { left: margin },
          head: [['Item', 'Rating', 'Notes']],
          body: ratingData,
          theme: 'striped',
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 60 }
          }
        } as UserOptions);
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
    }
  };

  // Add each inspection section
  addInspectionSection('Body Inspection', inspection.bodyInspection);
  addInspectionSection('Wheel Inspection', inspection.wheelInspection);
  addInspectionSection('Interior Inspection', inspection.interiorInspection);
  addInspectionSection('Electronics Checklist', inspection.electronicsChecklist, true);
  addInspectionSection('Interior Checklist', inspection.interiorChecklist, true);
  addInspectionSection('Exterior Checklist', inspection.exteriorChecklist, true);
  
  if (inspection.engineInspection) {
    checkPageBreak(40);
    addHeading('Engine Inspection');
    addText(`Overall Rating: ${getRatingText(inspection.engineInspection.score)}`);
    if (inspection.engineInspection.notes) {
      addText(`Notes: ${inspection.engineInspection.notes}`);
    }
    if (inspection.engineInspection.checklist) {
      addInspectionSection('Engine Checklist', inspection.engineInspection.checklist, true);
    }
  }

  if (inspection.undercarInspection) {
    checkPageBreak(40);
    addHeading('Undercar Inspection');
    addText(`Overall Rating: ${getRatingText(inspection.undercarInspection.score)}`);
    if (inspection.undercarInspection.notes) {
      addText(`Notes: ${inspection.undercarInspection.notes}`);
    }
  }

  if (inspection.testDrive) {
    addInspectionSection('Test Drive Results', inspection.testDrive);
  }

  // Final Notes
  if (inspection.finalNotes) {
    checkPageBreak(60);
    addHeading('Final Notes');
    const finalNotes = doc.splitTextToSize(inspection.finalNotes, contentWidth);
    doc.text(finalNotes, margin, yPos);
    yPos += (finalNotes.length * 7) + 10;
  }

  // Footer
  checkPageBreak(30);
  doc.setFontSize(10);
  doc.setTextColor(128);
  const reportDate = new Date(inspection.date).toLocaleDateString();
  doc.text(`Report generated on ${reportDate}`, margin, doc.internal.pageSize.getHeight() - 10);
  doc.text(`Report ID: ${inspection.id}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

  return doc.output('blob');
};
