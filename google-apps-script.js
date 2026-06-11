/**
 * GOOGLE APPS SCRIPT — Wedding RSVP + Ucapan (Leave a Message)
 * ─────────────────────────────────────────────────────────────
 * CARA PAKAI:
 * 1. Buka https://script.google.com → project kamu (atau New Project)
 * 2. Hapus semua kode, paste kode ini
 * 3. SHEET_ID di bawah = ID Google Sheet kamu
 *    (ambil dari URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
 * 4. Deploy > Manage deployments > Edit (ikon pensil) > Version: "New version" > Deploy
 *    (PENTING: harus deploy versi baru supaya perubahan aktif. URL /exec tetap sama.)
 *    - Execute as: Me
 *    - Who has access: Anyone
 *
 * Akan otomatis membuat 2 tab:
 *   • "RSVP"   → konfirmasi kehadiran
 *   • "Ucapan" → pesan / doa dari tamu (ditampilkan di web)
 */

const SHEET_ID     = '13W81EQfwVg6-_yqrXMH_jtOU12ZBq6CuAEe9kxTGHOU';
const RSVP_SHEET   = 'RSVP';
const UCAPAN_SHEET = 'Ucapan';

function doPost(e) {
  try {
    const ss   = SpreadsheetApp.openById(SHEET_ID);
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'ucapan') {
      // ── UCAPAN / LEAVE A MESSAGE ──
      let sheet = ss.getSheetByName(UCAPAN_SHEET);
      if (!sheet) {
        sheet = ss.insertSheet(UCAPAN_SHEET);
        sheet.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Ucapan']);
        styleHeader(sheet, 4);
      }
      sheet.appendRow([
        data.timestamp || new Date().toLocaleString('id-ID'),
        data.name      || '',
        data.hadir     || '',
        data.message   || '',
      ]);

    } else {
      // ── RSVP ──
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
    }

    return json({ status: 'ok' });

  } catch (err) {
    return json({ status: 'error', message: err.toString() });
  }
}

// GET: ?action=list  → kirim daftar ucapan (JSON) untuk ditampilkan di web
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    try {
      const ss    = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(UCAPAN_SHEET);
      const out   = [];
      if (sheet && sheet.getLastRow() > 1) {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
        rows.forEach(r => {
          if (r[1] || r[3]) {
            out.push({ timestamp: r[0], name: r[1], hadir: r[2], message: r[3] });
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

/**
 * JALANKAN SEKALI dari editor untuk membuat tab "RSVP" & "Ucapan".
 * Cara: pilih fungsi "setup" di dropdown atas → klik ▶ Run.
 * (Pertama kali akan minta izin akses spreadsheet — klik Allow.)
 */
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let rsvp = ss.getSheetByName(RSVP_SHEET);
  if (!rsvp) {
    rsvp = ss.insertSheet(RSVP_SHEET);
    rsvp.appendRow(['Timestamp', 'Nama', 'Jumlah Tamu', 'Kehadiran', 'Ucapan / Doa']);
    styleHeader(rsvp, 5);
  }

  let ucapan = ss.getSheetByName(UCAPAN_SHEET);
  if (!ucapan) {
    ucapan = ss.insertSheet(UCAPAN_SHEET);
    ucapan.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Ucapan']);
    styleHeader(ucapan, 4);
  }

  ucapan.setFrozenRows(1);
  rsvp.setFrozenRows(1);
  Logger.log('Setup selesai: tab "RSVP" & "Ucapan" siap.');
}
