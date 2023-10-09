import { readFile } from 'fs/promises';
import { PDFDocument, rgb } from 'pdf-lib';

import pdfLibFontkit from '@pdf-lib/fontkit';
import * as url from 'url';
import dayjs from 'dayjs';
import _ from 'lodash';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SESSION_DETAIL_FONT_SIZE = 8;
const CANDIDATES_PER_PAGE = 20;
const SESSION_DETAIL_DEFAULT_COLOR = rgb(0, 0, 0);

async function getAttendanceSheetPdfBuffer({
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
  session,
} = {}) {
  const templatePath = `${dirname}/files/FR-non-SCO-attendance-sheet.pdf`;
  const templateBuffer = await readFile(templatePath);

  const pdfDoc = await PDFDocument.create();

  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setModificationDate(creationDate);
  pdfDoc.registerFontkit(fontkit);

  const fontFile = await readFile(`${dirname}/files/Roboto-Regular.ttf`);
  const font = await pdfDoc.embedFont(fontFile, { subset: true, customName: 'Roboto-Regular.ttf' });

  const certificationCandidates = session.certificationCandidates;
  const certificationCandidatesSplitByPage = _.chunk(certificationCandidates, CANDIDATES_PER_PAGE);

  for (const [index, candidatesGroup] of certificationCandidatesSplitByPage.entries()) {
    const page = pdfDoc.addPage();
    const [templatePage] = await pdfDoc.embedPdf(templateBuffer);
    page.drawPage(templatePage);
    const pagesCount = certificationCandidatesSplitByPage.length;

    _drawPageNumber({ pageIndex: index, pagesCount, page, font });
    _drawSessionDate({ session, page, font });
    _drawSessionStartTime({ session, page, font });
    _drawSessionAddress({ session, page, font });
    _drawSessionRoom({ session, page, font });
    _drawSessionExaminer({ session, page, font });
    _drawSessionId({ session, page, font });

    candidatesGroup.forEach((candidate, index) => {
      const gap = 30;
      const initialY = 603;
      const y = initialY - gap * index;
      const firstName = _formatInformation(candidate.firstName);
      const lastName = _formatInformation(candidate.lastName);
      const externalId = _formatInformation(candidate.externalId);

      const parameters = [
        [30, y, firstName],
        [133, y, lastName],
        [238, y, _formatDate(candidate.birthdate)],
        [305, y, externalId],
      ];

      _drawCandidate({ parameters, page, font });
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function _drawPageNumber({ pageIndex, pagesCount, page, font }) {
  const pageNumber = (pageIndex + 1).toString();
  const pagePagination = `${pageNumber}/${pagesCount}`;
  page.drawText(pagePagination, {
    x: 61,
    y: 807,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: rgb(1, 1, 1),
  });
}

function _formatInformation(information, limit = 21) {
  if (information.length > limit) {
    return information.slice(0, limit) + '...';
  }

  return information;
}

function _drawSessionDate({ session, page, font }) {
  const date = new Date(session.date);
  const day = date.getDate();
  const year = date.getFullYear();
  const options = { month: 'short' };

  const month = new Intl.DateTimeFormat('fr', options).format(date);
  const fullDate = `${day} ${month} ${year}`;

  page.drawText(fullDate, {
    x: 62,
    y: 715,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionStartTime({ session, page, font }) {
  const [hours, minutes] = session.time.split(':');
  const hour = `${hours}h${minutes}`;
  page.drawText(hour, {
    x: 272,
    y: 715,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionAddress({ session, page, font }) {
  const address = _formatInformation(session.address, 22);
  page.drawText(address, {
    x: 89,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionRoom({ session, page, font }) {
  const room = _formatInformation(session.room);

  page.drawText(room, {
    x: 256,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionExaminer({ session, page, font }) {
  const examiner = _formatInformation(session.examiner, 40);

  page.drawText(examiner, {
    x: 410,
    y: 717,
    size: SESSION_DETAIL_FONT_SIZE,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionId({ session, page, font }) {
  const sessionId = String(session.id);
  page.drawText(sessionId, {
    x: 246,
    y: 739,
    size: 10,
    font,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawCandidate({ page, font, parameters }) {
  parameters.forEach(([x, y, text]) => {
    page.drawText(text, {
      x,
      y,
      size: SESSION_DETAIL_FONT_SIZE,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export { getAttendanceSheetPdfBuffer };
