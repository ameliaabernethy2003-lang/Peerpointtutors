# Data Extraction Guide

## Overview
This guide helps you extract exact financial data from SEC 10-K filings and populate the data files.

## Quick Start

### Option 1: Use the Helper Script
```bash
node scripts/get-filing-links.js
```
This will print direct links to all 10-K filings.

### Option 2: Manual Navigation
1. Visit: https://www.sec.gov/edgar/browse/?CIK=1670592&owner=exclude
2. Filter for "10-K" filings
3. For each year (2017-2024), click on the filing

## Step-by-Step Extraction Process

### For Each Year (2017-2024):

1. **Open the 10-K Filing**
   - Click on the filing link
   - Click "Documents" button
   - Find and open "10-K" or "Annual report [Section 13 and 15(d), not S-K Item 405]"

2. **Navigate to Item 8**
   - Use the table of contents or search for "Item 8"
   - Full title: "Item 8. Financial Statements and Supplementary Data"

3. **Extract Financial Statements**

   **Income Statement (Consolidated Statements of Operations):**
   - Net Sales
   - Cost of Goods Sold
   - Gross Profit
   - Operating Expenses (may be listed as "Selling, general and administrative expenses")
   - Operating Income
   - Interest Expense
   - Other Income (Expense)
   - Income Before Taxes
   - Income Tax Expense (Provision for income taxes)
   - Net Income

   **Balance Sheet (Consolidated Balance Sheets):**
   - Cash and Equivalents
   - Accounts Receivable, Net
   - Inventories
   - Prepaid Expenses and Other
   - Total Current Assets
   - Operating Leases ROU
   - PPE, net
   - Deferred Income Taxes
   - Goodwill
   - Intangible Assets, Net
   - Other Assets
   - Total Non-Current Assets
   - Total Assets
   - Accounts Payable
   - Accrued Expenses
   - Accrued Payroll
   - ST Debt
   - Operating Lease Liabilities
   - Taxes Payable
   - Total Current Liabilities
   - LT Debt
   - Non-Current Operating Lease
   - Total Non-Current Liabilities
   - Total Liabilities
   - Total Equity
   - Total Liabilities & Equity

   **Cash Flow Statement (Consolidated Statements of Cash Flows):**
   - Net Income
   - Depreciation & Amortization
   - Changes in Working Capital
   - Net Cash from Operating Activities
   - Capital Expenditures
   - Other Investing Activities
   - Net Cash from Investing Activities
   - Debt Issuance (Repayment)
   - Stock Repurchases
   - Dividends Paid
   - Net Cash from Financing Activities
   - Net Change in Cash
   - Beginning Cash
   - Ending Cash

4. **Important Notes:**
   - All values are in THOUSANDS (as reported in SEC filings)
   - Copy numbers EXACTLY as shown (e.g., if it says "1,595,220", enter `1595220`)
   - Use negative numbers for expenses/outflows (e.g., if shown as "(50,000)", enter `-50000`)
   - DO NOT round - use exact values
   - If a line item doesn't exist, use `0` or empty string `''`

## Files to Update

1. **`src/app/components/operatingModelData.ts`**
   - Update values for years 2017-2024
   - Replace all `0` placeholders with exact SEC values

2. **`src/app/components/financialData.ts`**
   - Verify all 2020-2024 values match Item 8 exactly

## Verification

After updating the data files:
1. Run `npm run build` to ensure no errors
2. Test the Excel download functionality
3. Verify the exported Excel file matches SEC filing values exactly

## Need Help?

If you encounter issues:
1. Check that you're looking at Item 8 (not other items)
2. Verify you're using the correct fiscal year
3. Ensure values are in thousands (not millions or full dollars)
4. Double-check that numbers match the SEC filing exactly

