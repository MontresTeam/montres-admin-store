import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export to Excel
export const exportToExcel = (data, filename = 'inventory-export') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

// Export to CSV
export const exportToCSV = (data, filename = 'inventory-export') => {
  try {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

// Export to PDF
export const exportToPDF = (data, stats, filename = 'inventory-report') => {
  try {
    const doc = new jsPDF();
    
    // Add title and date
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('Inventory Stock Report', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total Items: ${stats.totalItems} | Available: ${stats.available} | Sold: ${stats.sold}`, 14, 27);
    
    // Prepare table data
    const tableData = data.map(item => [
      item.brand || '',
      item.productName?.substring(0, 20) + (item.productName?.length > 20 ? '...' : '') || '',
      item.internalCode || '',
      item.quantity || 0,
      item.status?.toUpperCase() || '',
      `$${(item.cost || 0).toLocaleString()}`,
      `$${(item.sellingPrice || 0).toLocaleString()}`,
      item.soldPrice ? `$${item.soldPrice.toLocaleString()}` : '-',
      item.paymentMethod || '-',
      item.receivingAmount ? `$${item.receivingAmount.toLocaleString()}` : '-'
    ]);
    
    // Define table columns
    const headers = ['Brand', 'Product', 'Code', 'Qty', 'Status', 'Cost', 'Selling', 'Sold', 'Payment', 'Received'];
    
    // Generate table
    doc.autoTable({
      startY: 35,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 10 },
        4: { cellWidth: 15 }
      }
    });
    
    // Add summary at the end
    const finalY = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary:', 14, finalY);
    
    doc.setFontSize(10);
    doc.text(`Total Inventory Value: $${stats.totalValue.toLocaleString()}`, 14, finalY + 7);
    doc.text(`Total Revenue: $${stats.totalRevenue.toLocaleString()}`, 14, finalY + 12);
    doc.text(`Low Stock Items: ${stats.lowStock}`, 14, finalY + 17);
    
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Import from Excel/CSV
export const importFromFile = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Map and validate data
          const mappedData = jsonData.map((row, index) => {
            return {
              brand: row.brand || row.Brand || '',
              productName: row.productName || row['Product Name'] || '',
              internalCode: row.internalCode || row['Internal Code'] || row.code || '',
              quantity: parseInt(row.quantity || row.Quantity || 0),
              status: (row.status || row.Status || 'available').toLowerCase(),
              cost: parseFloat(row.cost || row.Cost || 0),
              sellingPrice: parseFloat(row.sellingPrice || row['Selling Price'] || 0),
              soldPrice: parseFloat(row.soldPrice || row['Sold Price'] || 0) || undefined,
              paymentMethod: row.paymentMethod || row['Payment Method'] || '',
              receivingAmount: parseFloat(row.receivingAmount || row['Receiving Amount'] || 0) || undefined,
              notes: row.notes || row.Notes || ''
            };
          });
          
          resolve(mappedData);
        } catch (parseError) {
          reject(new Error('Failed to parse file. Please check the format.'));
        }
      };
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
};