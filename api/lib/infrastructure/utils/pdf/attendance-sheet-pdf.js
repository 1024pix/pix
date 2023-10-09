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
  const templatePath = `${dirname}/files/attendance-sheet.pdf`;
  const templateBuffer = await readFile(templatePath);

  const pdfDoc = await PDFDocument.create();

  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setModificationDate(creationDate);
  pdfDoc.registerFontkit(fontkit);

  const robotoRegularFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Roboto-Regular.ttf' });
  const robotoMediumFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Roboto-Medium.ttf' });
  const nunitoBoldFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Nunito-Bold.ttf' });
  const nunitoRegularFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Nunito-Regular.ttf' });

  const certificationCandidates = session.certificationCandidates;
  const certificationCandidatesSplitByPage = _.chunk(certificationCandidates, CANDIDATES_PER_PAGE);

  for (const [index, candidatesGroup] of certificationCandidatesSplitByPage.entries()) {
    const page = pdfDoc.addPage();
    const [templatePage] = await pdfDoc.embedPdf(templateBuffer);
    page.drawPage(templatePage);
    const pagesCount = certificationCandidatesSplitByPage.length;

    _drawHeaderLabels({ page, nunitoBoldFont, nunitoRegularFont });
    _drawCertificationInformationLabels({ page, nunitoBoldFont, nunitoRegularFont });
    _drawExaminerSectionLabels({ page, nunitoBoldFont, nunitoRegularFont });
    _drawCandidatesTableLabels({ page, nunitoBoldFont, nunitoRegularFont, robotoMediumFont });

    _drawPageNumber({ pageIndex: index, pagesCount, page, robotoRegularFont });
    _drawSessionDate({ session, page, robotoRegularFont });
    _drawSessionStartTime({ session, page, robotoRegularFont });
    _drawSessionAddress({ session, page, robotoRegularFont });
    _drawSessionRoom({ session, page, robotoRegularFont });
    _drawSessionExaminer({ session, page, robotoRegularFont });
    _drawSessionId({ session, page, robotoRegularFont });

    candidatesGroup.forEach((candidate, index) => {
      const gapBetweenCandidates = 30;
      const firstCandidateYPosition = 603;
      const y = firstCandidateYPosition - gapBetweenCandidates * index;
      const firstName = _formatInformation(candidate.firstName);
      const lastName = _formatInformation(candidate.lastName);
      const externalId = _formatInformation(candidate.externalId);

      const parameters = [
        [30, y, firstName],
        [133, y, lastName],
        [238, y, _formatDate(candidate.birthdate)],
        [305, y, externalId],
      ];

      _drawCandidate({ parameters, page, robotoRegularFont });
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function _embedFontIntoPdf({ pdfDoc, dirname, font }) {
  const fontFile = await readFile(`${dirname}/files/${font}`);
  return pdfDoc.embedFont(fontFile, { subset: true });
}

function _drawHeaderLabels({ page, nunitoBoldFont, nunitoRegularFont }) {
  [
    [42, 807, 'Page', SESSION_DETAIL_FONT_SIZE, nunitoRegularFont],
    [42, 784, "Feuille d'émargement", 24, nunitoBoldFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(1, 1, 1),
    });
  });
}

function _drawCertificationInformationLabels({ page, nunitoBoldFont, robotoRegularFont }) {
  [
    [34, 739, 'La session de certification', 9, nunitoBoldFont],
    [230, 739, 'N°', 9, nunitoBoldFont],
    [34, 715, 'Date :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
    [189, 715, 'Heure locale (début) :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
    [34, 691, 'Nom du site :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
    [189, 691, 'Nom de la salle :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _drawExaminerSectionLabels({ page, nunitoBoldFont, robotoRegularFont }) {
  [
    [356, 739, 'Le(s) surveillants(s)', 9, nunitoBoldFont],
    [356, 717, 'Surveillé par :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
    [356, 697, 'Signature(s) :', SESSION_DETAIL_FONT_SIZE, robotoRegularFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _drawCandidatesTableLabels({ page, nunitoBoldFont, robotoRegularFont, robotoMediumFont }) {
  [
    [26, 660, 'Liste des candidats', 12, nunitoBoldFont],
    [33, 635, 'Nom de naissance', SESSION_DETAIL_FONT_SIZE, robotoMediumFont],
    [136, 635, 'Prénom', SESSION_DETAIL_FONT_SIZE, robotoMediumFont],
    [305, 635, 'Identifiant local', SESSION_DETAIL_FONT_SIZE, robotoMediumFont],
    [402, 635, 'Signature', SESSION_DETAIL_FONT_SIZE, robotoMediumFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });

  _drawDateOfBirthLabel({ page, robotoMediumFont, robotoRegularFont });
}

function _drawDateOfBirthLabel({ page, robotoMediumFont, robotoRegularFont }) {
  [
    [239, 645, 'Date', robotoMediumFont],
    [239, 636, 'de naissance', robotoMediumFont],
    [239, 627, '(jj/mm/aaaa)', robotoRegularFont],
  ].forEach(([x, y, text, font]) => {
    page.drawText(text, {
      x,
      y,
      size: SESSION_DETAIL_FONT_SIZE,
      font: font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _drawPageNumber({ pageIndex, pagesCount, page, robotoRegularFont }) {
  const pageNumber = (pageIndex + 1).toString();
  const pagePagination = `${pageNumber}/${pagesCount}`;
  page.drawText(pagePagination, {
    x: 61,
    y: 807,
    size: SESSION_DETAIL_FONT_SIZE,
    font: robotoRegularFont,
    color: rgb(1, 1, 1),
  });
}

function _formatInformation(information, limit = 21) {
  if (information.length > limit) {
    return information.slice(0, limit) + '...';
  }

  return information;
}

function _drawSessionDate({ session, page, robotoRegularFont }) {
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
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionStartTime({ session, page, robotoRegularFont }) {
  const [hours, minutes] = session.time.split(':');
  const hour = `${hours}h${minutes}`;
  page.drawText(hour, {
    x: 272,
    y: 715,
    size: SESSION_DETAIL_FONT_SIZE,
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionAddress({ session, page, robotoRegularFont }) {
  const address = _formatInformation(session.address, 22);
  page.drawText(address, {
    x: 89,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionRoom({ session, page, robotoRegularFont }) {
  const room = _formatInformation(session.room);

  page.drawText(room, {
    x: 256,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionExaminer({ session, page, robotoRegularFont }) {
  const examiner = _formatInformation(session.examiner, 40);

  page.drawText(examiner, {
    x: 410,
    y: 717,
    size: SESSION_DETAIL_FONT_SIZE,
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionId({ session, page, robotoRegularFont }) {
  const sessionId = String(session.id);
  page.drawText(sessionId, {
    x: 246,
    y: 739,
    size: 10,
    font: robotoRegularFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawCandidate({ page, robotoRegularFont, parameters }) {
  parameters.forEach(([x, y, text]) => {
    page.drawText(text, {
      x,
      y,
      size: SESSION_DETAIL_FONT_SIZE,
      font: robotoRegularFont,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export { getAttendanceSheetPdfBuffer };
