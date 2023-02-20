import { PDFDocument, rgb } from 'pdf-lib';
import { readFile } from 'fs/promises';
import pdfLibFontkit from '@pdf-lib/fontkit';
const MAX_SESSION_DETAIL_WIDTH = 155;
const SESSION_DETAIL_FONT_SIZE = 7;
const SESSION_DETAIL_LINE_HEIGHT = 8;

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
    size: SESSION_DETAIL_FONT_SIZE,
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
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionAddress(sessionForSupervisorKit, page, font) {
  const addressArray = _toArrayOfFixedWidthConservingWords(
    sessionForSupervisorKit.address,
    font,
    MAX_SESSION_DETAIL_WIDTH
  );
  addressArray.forEach((address, index) => {
    page.drawText(address, {
      x: 60,
      y: 616 - index * SESSION_DETAIL_LINE_HEIGHT,
      size: SESSION_DETAIL_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

function _drawSessionRoom(sessionForSupervisorKit, page, font) {
  const roomArray = _toArrayOfFixedWidthConservingWords(sessionForSupervisorKit.room, font, MAX_SESSION_DETAIL_WIDTH);
  roomArray.forEach((room, index) => {
    page.drawText(room, {
      x: 60,
      y: 584 - index * SESSION_DETAIL_LINE_HEIGHT,
      size: SESSION_DETAIL_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

function _drawSessionExaminer(sessionForSupervisorKit, page, font) {
  const examinerArray = _toArrayOfFixedWidthConservingWords(
    sessionForSupervisorKit.examiner,
    font,
    MAX_SESSION_DETAIL_WIDTH
  );
  examinerArray.forEach((examiner, index) => {
    page.drawText(examiner, {
      x: 60,
      y: 549 - index * SESSION_DETAIL_LINE_HEIGHT,
      size: SESSION_DETAIL_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
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

function _toArrayOfFixedWidthConservingWords(str, font, maxWidth) {
  const result = [];
  const words = str.split(' ');
  let index = 0;
  words.forEach((word) => {
    if (!result[index]) {
      result[index] = '';
    }
    if (font.widthOfTextAtSize(`${result[index]} ${word}`, 7) <= maxWidth) {
      result[index] += `${word} `;
    } else {
      index++;
      result[index] = `${word} `;
    }
  });
  return result.map((str) => str.trim());
}

export default {
  getSupervisorKitPdfBuffer,
};
