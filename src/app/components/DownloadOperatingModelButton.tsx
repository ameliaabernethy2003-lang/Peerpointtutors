'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState } from 'react';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface DownloadOperatingModelButtonProps {
  company: Company;
}

export default function DownloadOperatingModelButton({ company }: DownloadOperatingModelButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper function to calculate operating lease adjustments
  const calculateOperatingLeaseAdjustments = (balanceSheetData: any[], years: number[]) => {
    const adjustments: { [key: number]: { liability: number; interest: number } } = {};
    
    // Find operating lease liability values from balance sheet
    const currentLease = balanceSheetData.find(row => 
      row.Item && (row.Item.includes('Operating Lease') || row.Item.includes('Operating lease'))
    );
    const nonCurrentLease = balanceSheetData.find(row => 
      row.Item && (row.Item.includes('Non-Current Operating Lease') || row.Item.includes('Non-current Operating Lease'))
    );
    
    years.forEach(year => {
      const current = (typeof currentLease?.[year] === 'number' ? currentLease[year] : 0) || 0;
      const nonCurrent = (typeof nonCurrentLease?.[year] === 'number' ? nonCurrentLease[year] : 0) || 0;
      const totalLiability = current + nonCurrent;
      const interestExpense = Math.round(totalLiability * 0.05); // 5% cost of debt
      
      adjustments[year] = {
        liability: totalLiability,
        interest: interestExpense
      };
    });
    
    return adjustments;
  };

  const applyRowFormatting = (
    worksheet: ExcelJS.Worksheet,
    row: ExcelJS.Row,
    rowData: any,
    rowIndex: number,
    sheetName: string,
    data: any[],
    rowMap: { [itemName: string]: number },
    years: number[]
  ) => {
    const indentLevel = rowData.indent || 0;
    
    const labelCell = row.getCell(1);
    const indentText = '  '.repeat(indentLevel);
    labelCell.value = indentText + rowData.Item;
    
    const garamondFont = { name: 'Garamond', size: 11 };
    
    if (rowData.isHeader) {
      labelCell.font = { ...garamondFont, bold: true };
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
    } else if (rowData.isSubtotal) {
      labelCell.font = { ...garamondFont, bold: true };
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
      labelCell.border = {
        top: { style: 'thin' }
      };
    } else {
      labelCell.font = garamondFont;
      labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    years.forEach((year: number, colIndex: number) => {
      const cell = row.getCell(colIndex + 2);
      let value = rowData[year];
      
      // Get column letter for formulas (B, C, D, E, F, G, H, I for years 2017-2024)
      const colLetter = String.fromCharCode(66 + colIndex); // B=66, C=67, etc.
      const currentRowNum = row.number;
      
      // Handle formulas for calculated values (Income Statement only)
      if (sheetName === 'Income Statement') {
        if (rowData.isAdjustment && rowData.Item === 'Op. leases interest expense') {
          // Formula: Operating leases liabilities * 0.05
          const liabilityRow = rowMap['Operating leases liabilities'];
          if (liabilityRow) {
            cell.value = { formula: `=${colLetter}${liabilityRow}*0.05` };
            cell.numFmt = '#,##0_);(#,##0)';
            cell.font = { ...garamondFont, color: { argb: 'FF0000FF' } };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            return; // Skip rest of formatting for this cell
          }
        } else if (rowData.isCalculated && rowData.Item === 'Adjusted Operating Income') {
          // Formula: Operating Income + Op. leases interest expense
          const operatingIncomeRow = rowMap['Operating Income'];
          const leaseInterestRow = rowMap['Op. leases interest expense'];
          
          if (operatingIncomeRow && leaseInterestRow) {
            cell.value = { formula: `=${colLetter}${operatingIncomeRow}+${colLetter}${leaseInterestRow}` };
            cell.numFmt = '#,##0_);(#,##0)';
            cell.font = { ...garamondFont, bold: true };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' }
            };
            return; // Skip rest of formatting for this cell
          }
        } else if (rowData.Item === 'Income Before Taxes') {
          // Formula: Adjusted Operating Income - Interest Expense + Other Income (Expense)
          const adjustedOpIncomeRow = rowMap['Adjusted Operating Income'];
          const interestExpenseRow = rowMap['Interest Expense'];
          const otherIncomeRow = rowMap['Other Income (Expense)'];
          
          if (adjustedOpIncomeRow && interestExpenseRow && otherIncomeRow) {
            cell.value = { formula: `=${colLetter}${adjustedOpIncomeRow}-${colLetter}${interestExpenseRow}+${colLetter}${otherIncomeRow}` };
            cell.numFmt = '#,##0_);(#,##0)';
            cell.font = { ...garamondFont, bold: true };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' }
            };
            return; // Skip rest of formatting for this cell
          }
        } else if (rowData.Item === 'Net Income') {
          // Formula: Income Before Taxes - Income Tax Expense
          const incomeBeforeTaxesRow = rowMap['Income Before Taxes'];
          const incomeTaxRow = rowMap['Income Tax Expense'];
          
          if (incomeBeforeTaxesRow && incomeTaxRow) {
            cell.value = { formula: `=${colLetter}${incomeBeforeTaxesRow}-${colLetter}${incomeTaxRow}` };
            cell.numFmt = '#,##0_);(#,##0)';
            cell.font = { ...garamondFont, bold: true };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' }
            };
            return; // Skip rest of formatting for this cell
          }
        }
      }
      
      // Handle regular values (not formulas)
      if (value === '' || value === null || value === undefined) {
        cell.value = '';
      } else if (typeof value === 'number') {
        // CRITICAL: Store exact value from Item 8 of SEC filings - NO ROUNDING
        cell.value = value;
        cell.numFmt = '#,##0_);(#,##0)';
      } else {
        cell.value = value;
      }

      // Apply formatting
      if (rowData.isHeader) {
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (rowData.isSubtotal) {
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }
        };
      } else if (rowData.isAdjustment) {
        cell.font = { ...garamondFont, color: { argb: 'FF0000FF' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.font = garamondFont;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  };

  const createSheet = async (
    workbook: ExcelJS.Workbook,
    sheetName: string,
    data: any[],
    balanceSheetData?: any[]
  ) => {
    const worksheet = workbook.addWorksheet(sheetName);
    // Get years from data (dynamic based on available years)
    const years = Object.keys(data[0] || {})
      .filter(key => !['Item', 'isSubtotal', 'isHeader', 'isSpacer', 'indent', 'isAdjustment', 'isCalculated'].includes(key))
      .map(y => parseInt(y))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);
    
    // If no years found, use default
    const defaultYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const finalYears = years.length > 0 ? years : defaultYears;
    const garamondFont = { name: 'Garamond', size: 11 };

    worksheet.views = [{ showGridLines: false }];

    worksheet.getColumn(1).width = 40;
    finalYears.forEach((_, index) => {
      worksheet.getColumn(index + 2).width = 15;
    });

    const headerRow = worksheet.addRow([sheetName, ...finalYears.map(y => `FY${y}`)]);
    headerRow.height = 18;
    
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) {
        cell.value = sheetName;
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.value = `FY${finalYears[colNumber - 2]}`;
        cell.font = { ...garamondFont, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    worksheet.addRow(['']);

    // Track row numbers for formula references
    let currentRowNumber = 3; // Start after header (row 1) and spacer (row 2)
    const rowMap: { [itemName: string]: number } = {};

    // Calculate and populate adjustment values for Income Statement
    if (sheetName === 'Income Statement' && balanceSheetData) {
      const adjustments = calculateOperatingLeaseAdjustments(balanceSheetData, finalYears);
      
      data.forEach((row: any) => {
        if (row.Item && (row.Item.includes('Operating leases') || row.Item.includes('Operating Leases'))) {
          finalYears.forEach(year => {
            row[year] = adjustments[year]?.liability || 0;
          });
        }
        // Note: Op. leases interest expense will be a formula, so we don't set values here
      });
    }

    let previousRowType = '';

    data.forEach((rowData, index) => {
      if (rowData.isSpacer) {
        const spacerRow = worksheet.addRow(['']);
        spacerRow.height = 8;
        currentRowNumber++;
      } else {
        if (rowData.isHeader && previousRowType !== 'header' && previousRowType !== '') {
          const spacingRow = worksheet.addRow(['']);
          spacingRow.height = 8;
          currentRowNumber++;
        }

        const row = worksheet.addRow([
          rowData.Item,
          ...years.map(year => rowData[year] !== '' ? rowData[year] : '')
        ]);
        row.height = rowData.isHeader ? 18 : 15;
        
        // Store row number for formula references (only for non-spacer rows with Item names)
        if (rowData.Item && !rowData.isSpacer) {
          rowMap[rowData.Item] = currentRowNumber;
        }
        
        applyRowFormatting(worksheet, row, rowData, index, sheetName, data, rowMap, finalYears);
        currentRowNumber++;
        
        previousRowType = rowData.isHeader ? 'header' : rowData.isSubtotal ? 'subtotal' : 'item';
      }
    });
  };

  const downloadExcel = async () => {
    setIsDownloading(true);
    
    try {
      // Fetch financial data from API
      const response = await fetch(
        `/api/operating-model?cik=${company.cik}&company=${encodeURIComponent(company.name)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch financial data');
      }
      
      const data = await response.json();
      const { financialData, years } = data;
      
      if (!financialData || Object.keys(financialData).length === 0) {
        throw new Error('No financial data found in 10-K filings');
      }
      
      // Transform API data into Excel format
      const incomeStatement = transformToExcelFormat(financialData, 'incomeStatement', years);
      const balanceSheet = transformToExcelFormat(financialData, 'balanceSheet', years);
      const cashFlowStatement = transformToExcelFormat(financialData, 'cashFlowStatement', years);
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SG&A Financial Dashboard';
      workbook.created = new Date();

      await createSheet(workbook, 'Income Statement', incomeStatement);
      await createSheet(workbook, 'Balance Sheet', balanceSheet);
      await createSheet(workbook, 'Statement of Cash Flows', cashFlowStatement);

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `${company.ticker}_Operating_Model_${dateStr}.xlsx`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, fileName);
      
      setIsDownloading(false);
    } catch (error: any) {
      console.error('Error generating Excel file:', error);
      setIsDownloading(false);
      alert(`Error generating Excel file: ${error.message || 'Please try again.'}`);
    }
  };
  
  // Transform API response data into Excel row format
  const transformToExcelFormat = (
    financialData: any,
    statementType: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement',
    years: number[]
  ): any[] => {
    const rows: any[] = [];
    
    // Get data for each year
    years.forEach((year, yearIndex) => {
      const yearData = financialData[year];
      if (!yearData || !yearData[statementType]) {
        return;
      }
      
      const statementData = yearData[statementType];
      
      statementData.forEach((row: any, rowIndex: number) => {
        if (yearIndex === 0) {
          // First year - create new row
          const excelRow: any = {
            Item: row.Item,
            isSubtotal: false,
            isHeader: false,
            indent: 0,
          };
          
          // Add value for this year
          if (row.values && row.values.length > 0) {
            excelRow[year] = row.values[0] || 0;
          } else {
            excelRow[year] = 0;
          }
          
          rows.push(excelRow);
        } else {
          // Subsequent years - find matching row and add value
          const existingRow = rows.find(r => r.Item === row.Item);
          if (existingRow) {
            if (row.values && row.values.length > 0) {
              existingRow[year] = row.values[0] || 0;
            } else {
              existingRow[year] = 0;
            }
          } else {
            // New row item in this year
            const excelRow: any = {
              Item: row.Item,
              isSubtotal: false,
              isHeader: false,
              indent: 0,
            };
            
            // Fill previous years with 0
            for (let i = 0; i < yearIndex; i++) {
              excelRow[years[i]] = 0;
            }
            
            // Add value for this year
            if (row.values && row.values.length > 0) {
              excelRow[year] = row.values[0] || 0;
            } else {
              excelRow[year] = 0;
            }
            
            rows.push(excelRow);
          }
        }
      });
    });
    
    return rows;
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
          Download Operating Model (Excel)
        </>
      )}
    </button>
  );
}

