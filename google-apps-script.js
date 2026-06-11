/**
 * GOOGLE APPS SCRIPT — Wedding RSVP + Feed Ucapan
 * ─────────────────────────────────────────────────────────────
 * CARA PAKAI:
 * 1. Buka spreadsheet → Extensions → Apps Script (atau script.google.com)
 * 2. Hapus semua kode, paste kode ini, klik 💾 Save
 * 3. (opsional) Pilih fungsi "setup" → ▶ Run untuk membuat tab "RSVP"
 * 4. Deploy > Manage deployments > Edit (✏️) > Version: "New version" > Deploy
 *    - Execute as: Me   ·   Who has access: Anyone
 *    URL /exec tetap sama, jadi tidak perlu ubah index.html
 *
 * RSVP & ucapan disimpan di SATU tab: "RSVP"
 *   Kolom: Timestamp | Nama | Jumlah Tamu | Kehadiran | Ucapan / Doa
 * Website menampilkan ucapan dari kolom "Ucapan / Doa" (baris yang terisi).
 */

const SHEET_ID   = '13W81EQfwVg6-_yqrXMH_jtOU12ZBq6CuAEe9kxTGHOU';
const RSVP_SHEET = 'RSVP';

function doPost(e) {
  try {
    const ss   = SpreadsheetApp.openById(SHEET_ID);
    const data = JSON.parse(e.postData.contents);

    let sheet = ss.getSheetByName(RSVP_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(RSVP_SHEET);
      sheet.appendRow(['Timestamp', 'Nama', 'Jumlah Tamu', 'Kehadiran', 'Ucapan / Doa']);
      styleHeader(sheet, 5);
    }
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('id-ID'),
      data.name      || '',
      data.count     || '1',
      data.hadir     || '',
      data.message   || '',
    ]);

    return json({ status: 'ok' });
  } catch (err) {
    return json({ status: 'error', message: err.toString() });
  }
}

// GET ?action=list → daftar ucapan (baris RSVP yang punya isi "Ucapan / Doa")
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    try {
      const ss    = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(RSVP_SHEET);
      const out   = [];
      if (sheet && sheet.getLastRow() > 1) {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
        rows.forEach(r => {
          const message = (r[4] || '').toString().trim();
          if (message) {
            out.push({ timestamp: r[0], name: r[1], hadir: r[3], message: message });
          }
        });
      }
      return json({ ucapan: out });
    } catch (err) {
      return json({ ucapan: [], error: err.toString() });
    }
  }
  return ContentService
    .createTextOutput('Endpoint aktif ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}

/** JALANKAN SEKALI dari editor untuk membuat tab "RSVP". */
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let rsvp = ss.getSheetByName(RSVP_SHEET);
  if (!rsvp) {
    rsvp = ss.insertSheet(RSVP_SHEET);
    rsvp.appendRow(['Timestamp', 'Nama', 'Jumlah Tamu', 'Kehadiran', 'Ucapan / Doa']);
    styleHeader(rsvp, 5);
  }
  rsvp.setFrozenRows(1);
  Logger.log('Setup selesai: tab "RSVP" siap.');
}

function styleHeader(sheet, cols) {
  const h = sheet.getRange(1, 1, 1, cols);
  h.setBackground('#1a0f0d');
  h.setFontColor('#d4af37');
  h.setFontWeight('bold');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
