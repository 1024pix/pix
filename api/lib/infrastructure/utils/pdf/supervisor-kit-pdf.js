const { PDFDocument, rgb } = require('pdf-lib');
const { readFile } = require('fs/promises');
const pdfLibFontkit = require('@pdf-lib/fontkit');

async function getSupervisorKitPdfBuffer({
  sessionForSupervisorKit,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
} = {}) {
  const fileBuffer = await readFile(`${dirname}/files/kit-surveillant_template.pdf`);

  const pdfDoc = await PDFDocument.load(fileBuffer);

  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setModificationDate(creationDate);

  pdfDoc.registerFontkit(fontkit);

  const fontFile = await readFile(`${dirname}/files/Roboto-Medium.ttf`);
  const robotFont = await pdfDoc.embedFont(fontFile, { subset: true, customName: 'Roboto-Medium.ttf' });

  const [page] = pdfDoc.getPages();

  _drawSessionDate(sessionForSupervisorKit, page, robotFont);
  _drawSessionStartTime(sessionForSupervisorKit, page, robotFont);
  _drawSessionAddress(sessionForSupervisorKit, page, robotFont);
  _drawSessionExaminer(sessionForSupervisorKit, page, robotFont);
  _drawSessionRoom(sessionForSupervisorKit, page, robotFont);
  _drawSessionId(sessionForSupervisorKit, page, robotFont);
  _drawSupervisorPassword(sessionForSupervisorKit, page, robotFont);
  _drawAccessCode(sessionForSupervisorKit, page, robotFont);

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const fileName = `kit-surveillant-${sessionForSupervisorKit.id}.pdf`;

  return {
    buffer,
    fileName,
  };
}

function _drawSessionDate(sessionForSupervisorKit, page, font) {
  const date = new Date(sessionForSupervisorKit.date);
  const day = date.getDate();
  const year = date.getFullYear();
  const options = { month: 'short' };
  const month = new Intl.DateTimeFormat('fr-FR', options).format(date);

  const fullDate = day + ' ' + month + ' ' + year;
  page.drawText(fullDate, {
    x: 85,
    y: 646,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionStartTime(sessionForSupervisorKit, page, font) {
  const [hours, minutes] = sessionForSupervisorKit.time.split(':');
  const hour = `${hours}h${minutes}`;
  page.drawText(hour, {
    x: 182,
    y: 646,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionAddress(sessionForSupervisorKit, page, font) {
  const address = sessionForSupervisorKit.address;
  page.drawText(address, {
    x: 60,
    y: 614,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionRoom(sessionForSupervisorKit, page, font) {
  const room = sessionForSupervisorKit.room;
  page.drawText(room, {
    x: 60,
    y: 582,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionExaminer(sessionForSupervisorKit, page, font) {
  const examiner = sessionForSupervisorKit.examiner;
  page.drawText(examiner, {
    x: 60,
    y: 547,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionId(sessionForSupervisorKit, page, font) {
  const sessionId = String(sessionForSupervisorKit.id);
  const textWidth = font.widthOfTextAtSize(sessionId, 10);
  page.drawText(sessionId, {
    x: 277 - textWidth / 2,
    y: 594,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSupervisorPassword(sessionForSupervisorKit, page, font) {
  const supervisorPassword = `C-${sessionForSupervisorKit.supervisorPassword}`;
  const textWidth = font.widthOfTextAtSize(supervisorPassword, 10);
  page.drawText(supervisorPassword, {
    x: 383 - textWidth / 2,
    y: 594,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawAccessCode(sessionForSupervisorKit, page, font) {
  const accessCode = sessionForSupervisorKit.accessCode;
  const textWidth = font.widthOfTextAtSize(accessCode, 10);
  page.drawText(accessCode, {
    x: 486 - textWidth / 2,
    y: 594,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

module.exports = {
  getSupervisorKitPdfBuffer,
};
