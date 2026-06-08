/**
 * GOOGLE APPS SCRIPT — Wedding RSVP to Google Sheets
 * ─────────────────────────────────────────────────────
 * CARA PAKAI:
 * 1. Buka https://script.google.com
 * 2. Klik "New Project"
 * 3. Hapus semua kode, paste kode ini
 * 4. Ganti SHEET_ID di bawah dengan ID Google Sheet kamu
 *    (ambil dari URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
 * 5. Klik Deploy > New Deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Klik Deploy, copy URL-nya
 * 7. Paste URL ke dalam index.html di bagian:
 *    const SHEET_URL = 'PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE';
 */

const SHEET_ID = '13W81EQfwVg6-_yqrXMH_jtOU12ZBq6CuAEe9kxTGHOU';
const SHEET_NAME = 'RSVP'; // nama tab di sheet kamu

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Buat sheet kalau belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Nama', 'Jumlah Tamu', 'Kehadiran', 'Ucapan / Doa']);
      // Style header
      const header = sheet.getRange(1, 1, 1, 5);
      header.setBackground('#1a0f0d');
      header.setFontColor('#d4af37');
      header.setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp  || new Date().toLocaleString('id-ID'),
      data.name       || '',
      data.count      || '1',
      data.hadir      || '',
      data.message    || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test endpoint (GET) — bisa di-test langsung dari browser
function doGet(e) {
  return ContentService
    .createTextOutput('RSVP endpoint aktif ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
