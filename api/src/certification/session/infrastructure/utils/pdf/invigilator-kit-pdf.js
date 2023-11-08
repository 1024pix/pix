import { readFile } from 'fs/promises';

import { PDFDocument, rgb } from 'pdf-lib';

import pdfLibFontkit from '@pdf-lib/fontkit';
import * as url from 'url';
import { LOCALE } from '../../../../../shared/domain/constants.js';
import { PIX_CERTIF } from '../../../../../../lib/domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_SPOKEN } = LOCALE;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const MAX_SESSION_DETAIL_WIDTH = 155;
const SESSION_DETAIL_FONT_SIZE = 7;
const SESSION_DETAIL_LINE_HEIGHT = 8;
const { CURRENT_CERTIFICATION_VERSION } = PIX_CERTIF;

async function getInvigilatorKitPdfBuffer({
  sessionForInvigilatorKit,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
  lang = FRENCH_SPOKEN,
} = {}) {
  let templatePath;
  let fileName;
  const fileVersion = sessionForInvigilatorKit.version === CURRENT_CERTIFICATION_VERSION ? '' : '-v3';

  switch (lang) {
    case ENGLISH_SPOKEN:
      templatePath = `${dirname}/files/invigilator-kit_template.pdf`;
      fileName = `invigilator-kit-${sessionForInvigilatorKit.id}.pdf`;
      break;

    default:
      templatePath = `${dirname}/files/kit-surveillant_template${fileVersion}.pdf`;
      fileName = `kit-surveillant-${sessionForInvigilatorKit.id}${fileVersion}.pdf`;
      break;
  }

  const fileBuffer = await readFile(templatePath);

  const pdfDoc = await PDFDocument.load(fileBuffer);

  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setModificationDate(creationDate);

  pdfDoc.registerFontkit(fontkit);

  const fontFile = await readFile(`${dirname}/../../../../shared/infrastructure/utils/pdf/files/Roboto-Medium.ttf`);
  const robotFont = await pdfDoc.embedFont(fontFile, { subset: true, customName: 'Roboto-Medium.ttf' });

  const [page] = pdfDoc.getPages();

  _drawSessionDate({ lang, sessionForInvigilatorKit, page, robotFont });
  _drawSessionStartTime(sessionForInvigilatorKit, page, robotFont);
  _drawSessionAddress(sessionForInvigilatorKit, page, robotFont);
  _drawSessionExaminer(sessionForInvigilatorKit, page, robotFont);
  _drawSessionRoom(sessionForInvigilatorKit, page, robotFont);
  _drawSessionId(sessionForInvigilatorKit, page, robotFont);
  _drawInvigilatorPassword(sessionForInvigilatorKit, page, robotFont);
  _drawAccessCode(sessionForInvigilatorKit, page, robotFont);

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return {
    buffer,
    fileName,
  };
}

function _drawSessionDate({ lang, sessionForInvigilatorKit, page, font }) {
  const date = new Date(sessionForInvigilatorKit.date);
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

function _drawSessionStartTime(sessionForInvigilatorKit, page, font) {
  const [hours, minutes] = sessionForInvigilatorKit.time.split(':');
  const hour = `${hours}h${minutes}`;
  page.drawText(hour, {
    x: 182,
    y: 646,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawSessionAddress(sessionForInvigilatorKit, page, font) {
  const addressArray = _toArrayOfFixedWidthConservingWords(
    sessionForInvigilatorKit.address,
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

function _drawSessionRoom(sessionForInvigilatorKit, page, font) {
  const roomArray = _toArrayOfFixedWidthConservingWords(sessionForInvigilatorKit.room, font, MAX_SESSION_DETAIL_WIDTH);
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

function _drawSessionExaminer(sessionForInvigilatorKit, page, font) {
  const examinerArray = _toArrayOfFixedWidthConservingWords(
    sessionForInvigilatorKit.examiner,
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

function _drawSessionId(sessionForInvigilatorKit, page, font) {
  const sessionId = String(sessionForInvigilatorKit.id);
  const textWidth = font.widthOfTextAtSize(sessionId, 10);
  page.drawText(sessionId, {
    x: 277 - textWidth / 2,
    y: 594,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawInvigilatorPassword(sessionForInvigilatorKit, page, font) {
  const invigilatorPassword = `C-${sessionForInvigilatorKit.invigilatorPassword}`;
  const textWidth = font.widthOfTextAtSize(invigilatorPassword, 10);
  page.drawText(invigilatorPassword, {
    x: 383 - textWidth / 2,
    y: 594,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

function _drawAccessCode(sessionForInvigilatorKit, page, font) {
  const accessCode = sessionForInvigilatorKit.accessCode;
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

export { getInvigilatorKitPdfBuffer };
