'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { financialData } from './financialData';

export default function DownloadFinancialsButton() {
  const [isDownloading, setIsDownloading] = useState(false);

  const applyRowFormatting = (
    worksheet: ExcelJS.Worksheet,
    row: ExcelJS.Row,
    rowData: any,
    rowIndex: number,
    sheetName: string
  ) => {
    const years = [2020, 2021, 2022, 2023, 2024];
    const indentLevel = rowData.indent || 0;
    
    // Format label cell (column A) with proper indentation
    const labelCell = row.getCell(1);
    const indentText = '  '.repeat(indentLevel);
    labelCell.value = indentText + rowData.Item;
    
    // Set font to Garamond 11pt for all cells
    const garamondFont = { name: 'Garamond', size: 11 };
    
    if (rowData.isHeader) {
      // Section headers: bold, left-aligned
      labelCell.font = { ...garamondFont, bold: true };
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
    } else if (rowData.isSubtotal) {
      // Subtotals and totals: bold
      labelCell.font = { ...garamondFont, bold: true };
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
      // Single horizontal rule above subtotal row
      labelCell.border = {
        top: { style: 'thin' }
      };
    } else {
      // Regular line items: left-aligned, black text
      labelCell.font = garamondFont;
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    // Format year columns
    years.forEach((year, colIndex) => {
      const cell = row.getCell(colIndex + 2);
      const value = rowData[year];
      
      if (value === '' || value === null || value === undefined) {
        cell.value = '';
      } else if (typeof value === 'number') {
        // CRITICAL: Store exact value from Item 8 of SEC filings - NO ROUNDING
        // ExcelJS preserves the full precision of the number as stored
        // The value must be the exact number from Item 8, Financial Statements and Supplementary Data
        // Example: If Item 8 shows 1,595,220 (in thousands), store 1595220
        //          It will display as 1,595,220 in Excel (exact match)
        
        // Store the exact number - JavaScript numbers preserve full integer precision
        // for integers up to Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)
        // All SEC filing values in thousands are well within this range
        cell.value = value;
        
        // Number format: whole numbers with comma separators, parentheses for negatives
        // This format displays the exact stored value without any rounding
        // Format: #,##0 = thousands separator, _) = space for closing paren, ( = negative format
        // This format does NOT round - it only formats the display of the exact stored value
        cell.numFmt = '#,##0_);(#,##0)';
        
        // Ensure Excel treats this as an exact integer value (not a calculated/formula)
        // This prevents any automatic rounding that might occur in Excel
      } else {
        cell.value = value;
      }

      // Apply formatting based on row type
      if (rowData.isHeader) {
        // Section headers: bold, left-aligned (empty cells)
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (rowData.isSubtotal) {
        // Subtotals and totals: bold, right-aligned, single rule above
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }
        };
      } else if (rowData.isAdjustment) {
        // Adjustment lines in Cash Flow: blue text
        cell.font = { ...garamondFont, color: { argb: 'FF0000FF' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        // Regular line items: right-aligned, black text
        cell.font = garamondFont;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  };

  const createSheet = async (
    workbook: ExcelJS.Workbook,
    sheetName: string,
    data: any[]
  ) => {
    const worksheet = workbook.addWorksheet(sheetName);
    const years = [2020, 2021, 2022, 2023, 2024];
    const garamondFont = { name: 'Garamond', size: 11 };

    // Hide gridlines
    worksheet.views = [{ showGridLines: false }];

    // Set column widths
    worksheet.getColumn(1).width = 40; // Item column
    years.forEach((_, index) => {
      worksheet.getColumn(index + 2).width = 15;
    });

    // Create header row with sheet name and fiscal years on the same line
    const headerRow = worksheet.addRow([sheetName, ...years.map(y => `FY${y}`)]);
    headerRow.height = 18;
    
    // Format header row
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) {
        // Sheet name cell - bold, left-aligned
        cell.value = sheetName;
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        // Year cells - bold, center-aligned
        cell.value = `FY${years[colNumber - 2]}`;
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    // Add spacing row
    worksheet.addRow(['']);

    // Track previous row type for spacing before section headers
    let previousRowType = '';

    // Add data rows
    data.forEach((rowData, index) => {
      if (rowData.isSpacer) {
        const spacerRow = worksheet.addRow(['']);
        spacerRow.height = 8; // Vertical spacing for section separation
      } else {
        // Add extra spacing before section headers
        if (rowData.isHeader && previousRowType !== 'header' && previousRowType !== '') {
          const spacingRow = worksheet.addRow(['']);
          spacingRow.height = 8;
        }

        const row = worksheet.addRow([
          rowData.Item,
          ...years.map(year => rowData[year] !== '' ? rowData[year] : '')
        ]);
        row.height = rowData.isHeader ? 18 : 15;
        applyRowFormatting(worksheet, row, rowData, index, sheetName);
        
        previousRowType = rowData.isHeader ? 'header' : rowData.isSubtotal ? 'subtotal' : 'item';
      }
    });
  };

  const downloadExcel = async () => {
    setIsDownloading(true);
    
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Yeti Financial Dashboard';
      workbook.created = new Date();

      // Create sheets
      await createSheet(workbook, 'Income Statement', financialData.incomeStatement);
      await createSheet(workbook, 'Balance Sheet', financialData.balanceSheet);
      await createSheet(workbook, 'Statement of Cash Flows', financialData.cashFlowStatement);

      // Generate filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Yeti_Three_Statement_Model_${dateStr}.xlsx`;

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, fileName);
      
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      setIsDownloading(false);
      alert('Error generating Excel file. Please try again.');
    }
  };

  return (
    <button
      onClick={downloadExcel}
      disabled={isDownloading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Three-Statement Model (Excel)
        </>
      )}
    </button>
  );
}
