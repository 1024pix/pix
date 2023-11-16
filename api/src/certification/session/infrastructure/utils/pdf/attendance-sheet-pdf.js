import { readFile } from 'fs/promises';
import { PDFDocument, rgb } from 'pdf-lib';

import pdfLibFontkit from '@pdf-lib/fontkit';
import * as url from 'url';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
dayjs.extend(localizedFormat);

import _ from 'lodash';
import { LOCALE } from '../../../../../shared/domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_SPOKEN } = LOCALE;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SESSION_DETAIL_FONT_SIZE = 8;
const CANDIDATES_PER_PAGE = 20;
const SESSION_DETAIL_DEFAULT_COLOR = rgb(0, 0, 0);
const DATE_OF_BIRTH_DEFAULT_X = 239;

async function getAttendanceSheetPdfBuffer({
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
  session,
  i18n,
} = {}) {
  const translate = i18n.__;
  const lang = i18n.__('current-lang');

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

    _drawHeaderLabels({ page, titleFont, pageInformationFont, translate });
    _drawCertificationInformationLabels({
      page,
      titleFont,
      sessionLabelsAndCandidatesInformationFont,
      translate,
      lang,
    });
    _drawExaminerSectionLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont, translate });
    _drawCandidatesTableLabels({
      page,
      session,
      titleFont,
      sessionLabelsAndCandidatesInformationFont,
      tableLabelsFont,
      translate,
      lang,
    });

    _drawPageNumber({ pageIndex: index, pagesCount, page, sessionLabelsAndCandidatesInformationFont });
    _drawSessionDate({ session, page, sessionLabelsAndCandidatesInformationFont, lang });
    _drawSessionStartTime({ session, page, sessionLabelsAndCandidatesInformationFont, lang });
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
      const divisionOrExternalIdValue = session.isSco
        ? _formatInformation(candidate.division)
        : _formatInformation(candidate.externalId);

      const parameters = [
        [30, y, lastName],
        [133, y, firstName],
        [238, y, _formatDate(candidate.birthdate)],
        [305, y, divisionOrExternalIdValue],
      ];

      _drawCandidate({ parameters, page, sessionLabelsAndCandidatesInformationFont });
    });
  }

  const pdfBytes = await pdfDoc.save();

  const fileName = `${translate('attendance-sheet.file-name')}${session.id}.pdf`;
  const attendanceSheet = Buffer.from(pdfBytes);

  return { fileName, attendanceSheet };
}

async function _embedFontIntoPdf({ pdfDoc, dirname, font }) {
  const fontFile = await readFile(`${dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/${font}`);
  return pdfDoc.embedFont(fontFile, { subset: true });
}

function _drawHeaderLabels({ page, titleFont, pageInformationFont, translate }) {
  const pageLabel = translate('attendance-sheet.header.page');
  const titleLabel = translate('attendance-sheet.header.title');
  [
    [42, 807, pageLabel, SESSION_DETAIL_FONT_SIZE, pageInformationFont],
    [42, 784, titleLabel, 24, titleFont],
  ].forEach(([x, y, text, size, font]) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(1, 1, 1),
    });
  });
}

function _drawCertificationInformationLabels({
  page,
  titleFont,
  sessionLabelsAndCandidatesInformationFont,
  translate,
  lang,
}) {
  const certificationSessionLabel = translate('attendance-sheet.certification-information.session');
  const numberLabel = translate('attendance-sheet.certification-information.number');
  const dateLabel = translate('attendance-sheet.certification-information.date');
  const localTimeLabel = translate('attendance-sheet.certification-information.local-time');
  const locationNameLabel = translate('attendance-sheet.certification-information.location-name');
  const roomNameLabel = translate('attendance-sheet.certification-information.room-name');

  const labels = [
    [
      _getXPositionByLang({ lang, xEnPosition: 29, xFrPosition: 34 }),
      715,
      dateLabel,
      SESSION_DETAIL_FONT_SIZE,
      sessionLabelsAndCandidatesInformationFont,
    ],
    [
      _getXPositionByLang({ lang, xEnPosition: 202, xFrPosition: 189 }),
      715,
      localTimeLabel,
      SESSION_DETAIL_FONT_SIZE,
      sessionLabelsAndCandidatesInformationFont,
    ],
    [
      _getXPositionByLang({ lang, xEnPosition: 29, xFrPosition: 34 }),
      691,
      locationNameLabel,
      SESSION_DETAIL_FONT_SIZE,
      sessionLabelsAndCandidatesInformationFont,
    ],
    [
      _getXPositionByLang({ lang, xEnPosition: 202, xFrPosition: 189 }),
      691,
      roomNameLabel,
      SESSION_DETAIL_FONT_SIZE,
      sessionLabelsAndCandidatesInformationFont,
    ],
  ];

  [[34, 739, certificationSessionLabel, 9, titleFont], [230, 739, numberLabel, 9, titleFont], ...labels].forEach(
    ([x, y, text, size, font]) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: SESSION_DETAIL_DEFAULT_COLOR,
      });
    },
  );
}

function _drawExaminerSectionLabels({ page, titleFont, sessionLabelsAndCandidatesInformationFont, translate }) {
  const titleLabel = translate('attendance-sheet.examiner-information.title');
  const invigilatedByLabel = translate('attendance-sheet.examiner-information.invigilated-by');
  const signatureLabel = translate('attendance-sheet.examiner-information.signature');

  [
    [356, 739, titleLabel, 9, titleFont],
    [356, 717, invigilatedByLabel, SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
    [356, 697, signatureLabel, SESSION_DETAIL_FONT_SIZE, sessionLabelsAndCandidatesInformationFont],
  ].forEach(([x, y, text, size, font]) => {
    page.drawText(text, {
      x,
      y,
      size,
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
  translate,
  lang,
}) {
  const divisionOrExternalIdLabel = session.isSco
    ? translate('attendance-sheet.table.division')
    : translate('attendance-sheet.table.external-id');
  const titleLabel = translate('attendance-sheet.table.title');
  const birthNameLabel = translate('attendance-sheet.table.birth-name');
  const firstNameLabel = translate('attendance-sheet.table.first-name');
  const signatureLabel = translate('attendance-sheet.table.signature');

  [
    [26, 660, titleLabel, 12, titleFont],
    [33, 635, birthNameLabel, SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [136, 635, firstNameLabel, SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [305, 635, divisionOrExternalIdLabel, SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
    [402, 635, signatureLabel, SESSION_DETAIL_FONT_SIZE, tableLabelsFont],
  ].forEach(([x, y, text, fontSize, font]) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: SESSION_DETAIL_DEFAULT_COLOR,
    });
  });

  _drawDateOfBirthLabel({ page, tableLabelsFont, sessionLabelsAndCandidatesInformationFont, translate, lang });
}

function _drawDateOfBirthLabel({ page, tableLabelsFont, sessionLabelsAndCandidatesInformationFont, translate, lang }) {
  const dateOfBirthExampleLabel = translate('attendance-sheet.table.date-of-birth.example');
  const dateOfBirthLabel = translate('attendance-sheet.table.date-of-birth.label');

  const dateParts = _getDateOfBirthPartsByLang({
    lang,
    tableLabelsFont,
    sessionLabelsAndCandidatesInformationFont,
    dateOfBirthLabel,
    dateOfBirthExampleLabel,
  });

  dateParts.forEach(([x, y, text, font]) => {
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

function _drawSessionDate({ session, page, sessionLabelsAndCandidatesInformationFont, lang }) {
  const date = new Date(session.date);
  const day = date.getDate();
  const year = date.getFullYear();
  const options = { month: 'long' };

  const month = new Intl.DateTimeFormat(lang, options).format(date);
  const fullDate = `${day} ${month} ${year}`;

  page.drawText(fullDate, {
    x: 62,
    y: 715,
    size: SESSION_DETAIL_FONT_SIZE,
    font: sessionLabelsAndCandidatesInformationFont,
    color: SESSION_DETAIL_DEFAULT_COLOR,
  });
}

function _drawSessionStartTime({ session, page, sessionLabelsAndCandidatesInformationFont, lang }) {
  const sessionStartTimeFormat = _getSessionStartTimeFormat({ lang });
  const sessionStartTime = dayjs(session.date + session.time).format(sessionStartTimeFormat);

  page.drawText(sessionStartTime, {
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

function _getXPositionByLang({ lang, xEnPosition, xFrPosition }) {
  if (lang === ENGLISH_SPOKEN) {
    return xEnPosition;
  }
  return xFrPosition;
}

function _getDateOfBirthPartsByLang({
  lang,
  tableLabelsFont,
  sessionLabelsAndCandidatesInformationFont,
  dateOfBirthLabel,
  dateOfBirthExampleLabel,
}) {
  if (lang === FRENCH_SPOKEN) {
    return [
      [DATE_OF_BIRTH_DEFAULT_X, 645, dateOfBirthLabel.slice(0, 4), tableLabelsFont],
      [DATE_OF_BIRTH_DEFAULT_X, 636, dateOfBirthLabel.slice(5), tableLabelsFont],
      [DATE_OF_BIRTH_DEFAULT_X, 627, dateOfBirthExampleLabel, sessionLabelsAndCandidatesInformationFont],
    ];
  }

  return [
    [DATE_OF_BIRTH_DEFAULT_X, 638, dateOfBirthLabel, tableLabelsFont],
    [DATE_OF_BIRTH_DEFAULT_X, 629, dateOfBirthExampleLabel, sessionLabelsAndCandidatesInformationFont],
  ];
}

function _getSessionStartTimeFormat({ lang }) {
  if (lang === FRENCH_SPOKEN) {
    return 'HH:mm';
  }
  return 'LT';
}

export { getAttendanceSheetPdfBuffer };
