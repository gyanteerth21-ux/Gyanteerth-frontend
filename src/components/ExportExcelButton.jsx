import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExportExcelButton = ({ data, filename = 'export', sheetName = 'Sheet1', className = "btn btn-primary", omitPhone = false }) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    // omit sensitive contact details
    const cleanData = data.map(item => {
      const newItem = { ...item };
      if (omitPhone) {
        delete newItem.phone;
        delete newItem.mobile;
        delete newItem.number;
        delete newItem.mobile_number;
        delete newItem.phone_number;
      }
      delete newItem.password;
      return newItem;
    });

    // Create a new workbook and a worksheet
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    
    // Auto-size columns based on header keys
    const keys = Object.keys(cleanData[0] || {});
    const wscols = keys.map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport} 
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...className.includes('btn') ? {} : { padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 } }}
    >
      <Download size={18} />
      Export Excel
    </button>
  );
};

export default ExportExcelButton;
