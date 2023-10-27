import { readFile } from 'fs/promises';

import { PDFDocument, rgb } from 'pdf-lib';

import pdfLibFontkit from '@pdf-lib/fontkit';
import * as url from 'url';
import { LOCALE, PIX_CERTIF } from '../../../domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_SPOKEN } = LOCALE;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const MAX_SESSION_DETAIL_WIDTH = 155;
const SESSION_DETAIL_FONT_SIZE = 7;
const SESSION_DETAIL_LINE_HEIGHT = 8;
const { CURRENT_CERTIFICATION_VERSION } = PIX_CERTIF;

async function getSupervisorKitPdfBuffer({
  sessionForSupervisorKit,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
  lang = FRENCH_SPOKEN,
} = {}) {
  let templatePath;
  let fileName;
  const fileVersion = sessionForSupervisorKit.version === CURRENT_CERTIFICATION_VERSION ? '' : '-v3';

  switch (lang) {
    case ENGLISH_SPOKEN:
      templatePath = `${dirname}/files/invigilator-kit_template.pdf`;
      fileName = `invigilator-kit-${sessionForSupervisorKit.id}.pdf`;
      break;

    default:
      templatePath = `${dirname}/files/kit-surveillant_template${fileVersion}.pdf`;
      fileName = `kit-surveillant-${sessionForSupervisorKit.id}${fileVersion}.pdf`;
      break;
  }

  const fileBuffer = await readFile(templatePath);

  const pdfDoc = await PDFDocument.load(fileBuffer);

  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setModificationDate(creationDate);

  pdfDoc.registerFontkit(fontkit);

  const fontFile = await readFile(`${dirname}/files/Roboto-Medium.ttf`);
  const robotFont = await pdfDoc.embedFont(fontFile, { subset: true, customName: 'Roboto-Medium.ttf' });

  const [page] = pdfDoc.getPages();

  _drawSessionDate({ lang, sessionForSupervisorKit, page, robotFont });
  _drawSessionStartTime(sessionForSupervisorKit, page, robotFont);
  _drawSessionAddress(sessionForSupervisorKit, page, robotFont);
  _drawSessionExaminer(sessionForSupervisorKit, page, robotFont);
  _drawSessionRoom(sessionForSupervisorKit, page, robotFont);
  _drawSessionId(sessionForSupervisorKit, page, robotFont);
  _drawSupervisorPassword(sessionForSupervisorKit, page, robotFont);
  _drawAccessCode(sessionForSupervisorKit, page, robotFont);

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return {
    buffer,
    fileName,
  };
}

function _drawSessionDate({ lang, sessionForSupervisorKit, page, font }) {
  const date = new Date(sessionForSupervisorKit.date);
  const day = date.getDate();
  const year = date.getFullYear();
  const options = { month: 'short' };
  let month, fullDate;

  if (lang === ENGLISH_SPOKEN) {
    month = new Intl.DateTimeFormat(lang, options).format(date);
    fullDate = `${year} ${month} ${day}`;
  } else {
    month = new Intl.DateTimeFormat(FRENCH_SPOKEN, options).format(date);
    fullDate = `${day} ${month} ${year}`;
  }

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
    MAX_SESSION_DETAIL_WIDTH,
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
    MAX_SESSION_DETAIL_WIDTH,
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

export { getSupervisorKitPdfBuffer };
