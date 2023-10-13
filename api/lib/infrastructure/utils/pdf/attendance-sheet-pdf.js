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

  const sessionLabelsAndCandidatesInformationFont = await _embedFontIntoPdf({
    pdfDoc,
    dirname,
    font: 'Roboto-Regular.ttf',
  });
  const tableLabelsFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Roboto-Medium.ttf' });
  const titleFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Nunito-Bold.ttf' });
  const pageInformationFont = await _embedFontIntoPdf({ pdfDoc, dirname, font: 'Nunito-Regular.ttf' });

  const certificationCandidates = session.certificationCandidates;
  const certificationCandidatesSplitByPage = _.chunk(certificationCandidates, CANDIDATES_PER_PAGE);

  for (const [index, candidatesGroup] of certificationCandidatesSplitByPage.entries()) {
    const page = pdfDoc.addPage();
    const [templatePage] = await pdfDoc.embedPdf(templateBuffer);
    page.drawPage(templatePage);
    const pagesCount = certificationCandidatesSplitByPage.length;

    _drawHeaderLabels({ page, titleFont, pageInformationFont });
    _drawCertificationInformationLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont });
    _drawExaminerSectionLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont });
    _drawCandidatesTableLabels({
      page,
      session,
      titleFont,
      sessionLabelsAndCandidatesInformationFont,
      tableLabelsFont,
    });

    _drawPageNumber({ pageIndex: index, pagesCount, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionDate({ session, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionStartTime({ session, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionAddress({ session, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionRoom({ session, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionExaminer({ session, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionId({ session, page, sessionLabelsAndCandidatesInformationFont });

    candidatesGroup.forEach((candidate, index) => {
      const gapBetweenCandidates = 30;
      const firstCandidateYPosition = 603;
      const y = firstCandidateYPosition - gapBetweenCandidates * index;
      const firstName = _formatInformation(candidate.firstName);
      const lastName = _formatInformation(candidate.lastName);
      const divisionOrExternalIdValue = _isScoCertificationCenterAndManagingStudentOrganization({ session })
        ? _formatInformation(candidate.division)
        : _formatInformation(candidate.externalId);

      const parameters = [
        [30, y, firstName],
        [133, y, lastName],
        [238, y, _formatDate(candidate.birthdate)],
        [305, y, divisionOrExternalIdValue],
      ];

      _drawCandidate({ parameters, page, sessionLabelsAndCandidatesInformationFont });
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function _embedFontIntoPdf({ pdfDoc, dirname, font }) {
  const fontFile = await readFile(`${dirname}/files/${font}`);
  return pdfDoc.embedFont(fontFile, { subset: true });
}

function _drawHeaderLabels({ page, titleFont, pageInformationFont }) {
  [
    [42, 807, 'Page', SESSION_DETAIL_FONT_SIZE, pageInformationFont],
    [42, 784, "Feuille d'émargement", 24, titleFont],
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

function _drawCertificationInformationLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont }) {
  [
    [34, 739, 'La session de certification', 9, titleFont],
    [230, 739, 'N°', 9, titleFont],
    [34, 715, 'Date :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
    [189, 715, 'Heure locale (début) :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
    [34, 691, 'Nom du site :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
    [189, 691, 'Nom de la salle :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
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

function _drawExaminerSectionLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont }) {
  [
    [356, 739, 'Le(s) surveillants(s)', 9, titleFont],
    [356, 717, 'Surveillé par :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
    [356, 697, 'Signature(s) :', SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
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

function _drawCandidatesTableLabels({
  session,
  page,
  titleFont,
  sessionLabelsAndCandidatesInformationFont,
  tableLabelsFont,
}) {
  const divisionOrExternalIdLabel = _isScoCertificationCenterAndManagingStudentOrganization({ session })
    ? 'Classe'
    : 'Identifiant local';
  [
    [26, 660, 'Liste des candidats', 12, titleFont],
    [33, 635, 'Nom de naissance', SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [136, 635, 'Prénom', SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [305, 635, divisionOrExternalIdLabel, SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [402, 635, 'Signature', SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });

  _drawDateOfBirthLabel({ page, tableLabelsFont, sessionLabelsAndCandidatesInformationFont });
}

function _drawDateOfBirthLabel({ page, tableLabelsFont, sessionLabelsAndCandidatesInformationFont }) {
  [
    [239, 645, 'Date', tableLabelsFont],
    [239, 636, 'de naissance', tableLabelsFont],
    [239, 627, '(jj/mm/aaaa)', sessionLabelsAndCandidatesInformationFont],
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

function _drawPageNumber({ pageIndex, pagesCount, page, sessionLabelsAndCandidatesInformationFont }) {
  const pageNumber = (pageIndex + 1).toString();
  const pagePagination = `${pageNumber}/${pagesCount}`;
  page.drawText(pagePagination, {
    x: 61,
    y: 807,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: rgb(1, 1, 1),
  });
}

function _formatInformation(information, limit = 21) {
  if (information?.length > limit) {
    return information.slice(0, limit) + '...';
  }

  return information || '';
}

function _drawSessionDate({ session, page, sessionLabelsAndCandidatesInformationFont }) {
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
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionStartTime({ session, page, sessionLabelsAndCandidatesInformationFont }) {
  const [hours, minutes] = session.time.split(':');
  const hour = `${hours}h${minutes}`;
  page.drawText(hour, {
    x: 272,
    y: 715,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionAddress({ session, page, sessionLabelsAndCandidatesInformationFont }) {
  const address = _formatInformation(session.address, 22);
  page.drawText(address, {
    x: 89,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionRoom({ session, page, sessionLabelsAndCandidatesInformationFont }) {
  const room = _formatInformation(session.room);

  page.drawText(room, {
    x: 256,
    y: 691,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionExaminer({ session, page, sessionLabelsAndCandidatesInformationFont }) {
  const examiner = _formatInformation(session.examiner, 40);

  page.drawText(examiner, {
    x: 410,
    y: 717,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionId({ session, page, sessionLabelsAndCandidatesInformationFont }) {
  const sessionId = String(session.id);
  page.drawText(sessionId, {
    x: 246,
    y: 739,
    size: 10,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawCandidate({ page, sessionLabelsAndCandidatesInformationFont, parameters }) {
  parameters.forEach(([x, y, text]) => {
    page.drawText(text, {
      x,
      y,
      size: SESSION_DETAIL_FONT_SIZE,
      font: sessionLabelsAndCandidatesInformationFont,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });
}

function _formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

function _isScoCertificationCenterAndManagingStudentOrganization({ session }) {
  return session.certificationCenterType === 'SCO' && session.isOrganizationManagingStudents;
}

export { getAttendanceSheetPdfBuffer };
