import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* =========================================
   EXPORT TO EXCEL
========================================= */
export const exportToExcel = (data, filename = 'inventory-export') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/* =========================================
   EXPORT TO CSV
========================================= */
export const exportToCSV = (data, filename = 'inventory-export') => {
  try {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`)
          .join(',')
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

/* =========================================
   EXPORT TO PDF (FULL DATA)
========================================= */
export const exportToPDF = (data, stats, filename = 'inventory-report') => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // TITLE
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Inventory Stock Report', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(
      `Total Items: ${stats.totalItems} | Available: ${stats.available} | Sold: ${stats.sold}`,
      14,
      28
    );

    // TABLE
    const headers = [
      'Brand',
      'Product Name',
      'Internal Code',
      'Qty',
      'Status',
      'Cost',
      'Selling Price',
      'Sold Price',
      'Payment Method',
      'Received Amount'
    ];

    const tableData = data.map(item => [
      item.brand || '-',
      item.productName || '-',
      item.internalCode || '-',
      item.quantity ?? 0,
      item.status?.toUpperCase() || '-',
      item.cost ? `AED${item.cost.toLocaleString()}` : '-',
      item.sellingPrice ? `AED${item.sellingPrice.toLocaleString()}` : '-',
      item.soldPrice ? `AED${item.soldPrice.toLocaleString()}` : '-',
      item.paymentMethod || '-',
      item.receivingAmount ? `AED${item.receivingAmount.toLocaleString()}` : '-'
    ]);

    autoTable(doc, {
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
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // SUMMARY
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 14, finalY);

    doc.setFontSize(10);
    doc.text(`Total Inventory Value: $${stats.totalValue.toLocaleString()}`, 14, finalY + 8);
    doc.text(`Total Revenue: $${stats.totalRevenue.toLocaleString()}`, 14, finalY + 14);
    doc.text(`Low Stock Items: ${stats.lowStock}`, 14, finalY + 20);

    // SAVE PDF
    doc.save(`${filename}.pdf`);
    return true;

  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};

/* =========================================
   IMPORT FROM EXCEL/CSV
========================================= */
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

          const mappedData = jsonData.map((row) => ({
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
          }));

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
