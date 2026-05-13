// NGexport Checklist Verifier — Audit Log
// Deploy as: Extensions → Apps Script → Deploy → New deployment
//   Type: Web App | Execute as: Me | Who has access: Anyone
// Copy the Web App URL and paste it into SHEETS_SCRIPT_URL in index.html

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data  = JSON.parse(e.postData.contents);

    // Write bold frozen header row on first use
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Invoice No', 'Invoice Date', 'GSTIN', 'HSN / Tariff Item',
        'Currency', 'Forex Rate (₹/USD)',
        'FOB Value (INR)', 'RoDTEP Amount', 'Drawback Amount', 'Total Invoice Value (Checklist)',
        'Overall Result',
        'R1: GSTIN', 'R2: Invoice No', 'R3: Invoice Date', 'R4: RoDTEP',
        'R5: Drawback', 'R6: FOB', 'R7: IGST Value', 'R8: IGST Amount', 'R9: Total Invoice'
      ];
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8f5e9');
    }

    const r = data.rules || [];
    sheet.appendRow([
      data.timestamp,
      data.invoice_no          || '—',
      data.invoice_date        || '—',
      data.gstin               || '—',
      data.hsn                 || '—',
      data.currency            || '—',
      data.forex_rate          || '—',
      data.fob_value           || '—',
      data.rodtep_amount       || '—',
      data.drawback_amount     || '—',
      data.total_invoice_value || '—',
      data.overall,
      r[0] || '—', r[1] || '—', r[2] || '—', r[3] || '—', r[4] || '—',
      r[5] || '—', r[6] || '—', r[7] || '—', r[8] || '—'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
