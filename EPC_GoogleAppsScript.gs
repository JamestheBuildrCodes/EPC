// ============================================================
//  EPC First Timer Form — Google Apps Script Backend
//  Paste this entire file into your Apps Script editor
//  at: https://script.google.com
// ============================================================

// ✏️  STEP 1: Replace this with your actual Google Sheet ID
//  (It's the long string in your Sheet's URL between /d/ and /edit)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// ✏️  STEP 2: Set the sheet tab name (default is "Sheet1")
const SHEET_TAB = 'First Timers';

// Column headers — these will be auto-created on first submission
const HEADERS = [
  'Timestamp (WAT)',
  'First Name',
  'Last Name',
  'Day of Birth',
  'Month of Birth',
  'Gender',
  'Marital Status',
  'Occupation',
  'Phone Number',
  'Email Address',
  'Residential Address',
  'How They Heard',
  'Born Again?',
  'Areas of Interest',
  'Prayer Request',
  'Wants Follow-up?',
  'Submitted At'
];

// ── MAIN HANDLER ──────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendToSheet(data);
    return jsonResponse({ status: 'success', message: 'Registered successfully' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// Also handle GET (for testing in browser)
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'EPC First Timer endpoint is live 🙌' });
}

// ── SHEET WRITER ──────────────────────────────────────────────
function appendToSheet(data) {
  const ss   = SpreadsheetApp.openById(SHEET_ID);
  let sheet  = ss.getSheetByName(SHEET_TAB);

  // Create the tab if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB);
  }

  // Write headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0A1628');
    headerRange.setFontColor('#C9954A');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS.length, 180);
  }

  // Map form fields → columns
  const row = [
    new Date(),                            // Timestamp
    data.firstName      || '',
    data.lastName       || '',
    data.dobDay         || '',
    data.dobMonth       || '',
    data.gender         || '',
    data.marital        || '',
    data.occupation     || '',
    data.phone          || '',
    data.email          || '',
    data.address        || '',
    data.source         || '',
    data.bornAgain      || '',
    data.interests      || '',
    data.prayer         || '',
    data.followup === 'on' ? 'Yes' : 'No',
    data.submittedAt    || ''
  ];

  sheet.appendRow(row);

  // Auto-resize columns after writing
  sheet.autoResizeColumns(1, HEADERS.length);

  // Optional: send an email notification to the pastor
  // sendNotificationEmail(data);
}

// ── OPTIONAL EMAIL NOTIFICATION ───────────────────────────────
// Uncomment and fill in to receive an email on each new registrant
/*
function sendNotificationEmail(data) {
  const TO      = 'pastor@yourchurch.com';  // ✏️ Change this
  const subject = `New First Timer: ${data.firstName} ${data.lastName}`;
  const body    = `
A new first timer has registered at Everything by Prayer Church!

Name:        ${data.firstName} ${data.lastName}
Phone:       ${data.phone}
Email:       ${data.email || 'Not provided'}
Gender:      ${data.gender}
Born Again:  ${data.bornAgain}
Interests:   ${data.interests}
Follow-up:   ${data.followup === 'on' ? 'Yes' : 'No'}

Prayer Request:
${data.prayer || 'None'}

Submitted: ${data.submittedAt}
  `.trim();

  MailApp.sendEmail(TO, subject, body);
}
*/

// ── HELPER ────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
