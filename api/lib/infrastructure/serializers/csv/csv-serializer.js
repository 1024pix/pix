import { logger } from '../../logger.js';
import { FileValidationError } from '../../../../lib/domain/errors.js';
import { convertDateValue } from '../../../../src/shared/infrastructure/utils/date-utils.js';
import { headers, emptySession, COMPLEMENTARY_CERTIFICATION_SUFFIX } from '../../utils/csv/sessions-import.js';
import lodash from 'lodash';

const { isEmpty } = lodash;

import { csvHelper } from '../../helpers/csv.js';
const { checkCsvHeader, parseCsvWithHeader } = csvHelper;

function _csvFormulaEscapingPrefix(data) {
  const mayBeInterpretedAsFormula = /^[-@=+]/.test(data);
  return mayBeInterpretedAsFormula ? "'" : '';
}

function _csvSerializeValue(data) {
  if (typeof data === 'number') {
    return data.toString().replace(/\./, ',');
  } else if (typeof data === 'string') {
    if (/^[0-9-]+$/.test(data)) {
      return data;
    } else {
      return `"${_csvFormulaEscapingPrefix(data)}${data.replace(/"/g, '""')}"`;
    }
  } else {
    logger.error(`Unknown value type in _csvSerializeValue: ${typeof data}: ${data}`);
    return '""';
  }
}

function deserializeForSessionsImport({ parsedCsvData, hasBillingMode }) {
  const sessions = [];
  const expectedHeadersKeys = Object.keys(headers);

  const csvBillingModeKey = headers.billingMode;
  const csvPrepaymentCodeKey = headers.prepaymentCode;
  const firstCsvLine = parsedCsvData?.[0];

  _verifiyFileIntegrity({ firstCsvLine, hasBillingMode, csvBillingModeKey, csvPrepaymentCodeKey, expectedHeadersKeys });

  parsedCsvData.forEach((lineDTO, index) => {
    const dataFromColumnName = _getDataFromColumnNames({ expectedHeadersKeys, headers, line: lineDTO });
    const FIRST_DATA_LINE = 2;
    const data = { ...dataFromColumnName, line: index + FIRST_DATA_LINE };

    let currentParsedSession;
    if (_hasSessionInformation(data)) {
      currentParsedSession = sessions.find((session) => session.uniqueKey === _generateUniqueKey(data));
      if (!currentParsedSession) {
        currentParsedSession = _createSession(data);
        sessions.push(currentParsedSession);
      }
    } else if (_hasSessionIdAndCandidateInformation(data)) {
      currentParsedSession = sessions.find((session) => session.sessionId === data.sessionId);
      if (!currentParsedSession) {
        currentParsedSession = {
          sessionId: data.sessionId,
          line: data.line,
          certificationCandidates: [],
        };
        sessions.push(currentParsedSession);
      }
    } else {
      const previousLineSession = sessions.at(-1);
      if (previousLineSession) {
        currentParsedSession = previousLineSession;
      } else {
        currentParsedSession = emptySession;
        currentParsedSession.line = data.line;
        sessions.push(currentParsedSession);
      }
    }

    const examiner = data.examiner.trim();
    if (examiner.length && !currentParsedSession.examiner.includes(examiner)) {
      currentParsedSession.examiner.push(examiner);
    }

    if (_hasCandidateInformation(data)) {
      currentParsedSession.certificationCandidates.push(_createCandidate(data));
    }
  });

  return sessions.map((session) => ({
    ...session,
    examiner: session.examiner ? session.examiner.join(', ') : '',
  }));
}

async function deserializeForOrganizationsImport(file) {
  const requiredFieldNames = [
    'type',
    'externalId',
    'name',
    'provinceCode',
    'credit',
    'emailInvitations',
    'emailForSCOActivation',
    'identityProviderForCampaigns',
    'organizationInvitationRole',
    'locale',
    'tags',
    'createdBy',
    'documentationUrl',
    'targetProfiles',
    'isManagingStudents',
    'DPOFirstName',
    'DPOLastName',
    'DPOEmail',
  ];
  const batchOrganizationOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (columnName === 'isManagingStudents') {
        value = value?.toLowerCase() === 'true';
      }
      if (!isEmpty(value)) {
        if (
          columnName === 'type' ||
          columnName === 'organizationInvitationRole' ||
          columnName === 'identityProviderForCampaigns'
        ) {
          value = value.toUpperCase();
        }
        if (columnName === 'createdBy') {
          value = parseInt(value, 10);
        }
        if (columnName === 'emailInvitations' || columnName === 'emailForSCOActivation' || columnName === 'DPOEmail') {
          value = value.replaceAll(' ', '').toLowerCase();
        }
      } else {
        if (columnName === 'credit') {
          value = 0;
        }
        if (
          columnName === 'identityProviderForCampaigns' ||
          columnName === 'DPOFirstName' ||
          columnName === 'DPOLastName' ||
          columnName === 'DPOEmail'
        ) {
          value = null;
        }
        if (columnName === 'locale') {
          value = 'fr-fr';
        }
      }
      return value;
    },
  };

  await checkCsvHeader({ filePath: file, requiredFieldNames });

  return await parseCsvWithHeader(file, batchOrganizationOptionsWithHeader);
}

const requiredFieldNamesForCampaignsImport = [
  "Identifiant de l'organisation*",
  'Nom de la campagne*',
  'Identifiant du profil cible*',
  'Identifiant du créateur*',
];

async function deserializeForCampaignsImport(file, { checkCsvHeader, readCsvFile, parseCsvData } = csvHelper) {
  await checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForCampaignsImport });

  const cleanedData = await readCsvFile(file);
  return parseForCampaignsImport(cleanedData, { parseCsvData });
}

async function parseForCampaignsImport(cleanedData, { parseCsvData } = csvHelper) {
  const batchCampaignsOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    dynamicTyping: false,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (
        [
          "Identifiant de l'organisation*",
          'Identifiant du profil cible*',
          'Identifiant du créateur*',
          'Identifiant du propriétaire',
        ].includes(columnName)
      ) {
        value = parseInt(value, 10);
      }
      if (requiredFieldNamesForCampaignsImport.includes(columnName) && !value) {
        throw new FileValidationError(
          'CSV_CONTENT_NOT_VALID',
          `${value === '' ? '"empty"' : value} is not a valid value for "${columnName}"`,
        );
      }
      return value;
    },
  };
  const data = await parseCsvData(cleanedData, batchCampaignsOptionsWithHeader);

  return data.map((data) => ({
    organizationId: data["Identifiant de l'organisation*"],
    name: data['Nom de la campagne*'],
    targetProfileId: data['Identifiant du profil cible*'],
    idPixLabel: data["Libellé de l'identifiant externe"],
    creatorId: data['Identifiant du créateur*'],
    title: data['Titre du parcours'],
    customLandingPageText: data['Descriptif du parcours'],
    multipleSendings: data['Envoi multiple'].toLowerCase() === 'oui' ? true : false,
    ownerId: data['Identifiant du propriétaire'] || null,
    customResultPageText: data['Texte de la page de fin de parcours'] || null,
    customResultPageButtonText: data['Texte du bouton de la page de fin de parcours'] || null,
    customResultPageButtonUrl: data['URL du bouton de la page de fin de parcours'] || null,
  }));
}

function _hasSessionIdAndCandidateInformation(data) {
  return _hasCandidateInformation(data) && data.sessionId;
}

function _getDataFromColumnNames({ expectedHeadersKeys, headers, line }) {
  const data = {};
  data.complementaryCertifications = _extractComplementaryCertificationLabelsFromLine(line);

  expectedHeadersKeys.forEach((key) => {
    const headerLabel = headers[key];
    const currentValue = line[headerLabel];
    if (key === 'birthdate' || key === 'date') {
      data[key] =
        convertDateValue({
          dateString: currentValue,
          inputFormat: 'DD/MM/YYYY',
          outputFormat: 'YYYY-MM-DD',
        }) ?? currentValue;
    } else if (key === 'extraTimePercentage') {
      data[key] = currentValue || null;
    } else if (key === 'prepaymentCode') {
      data[key] = currentValue || null;
    } else {
      data[key] = currentValue;
    }
  });
  return data;
}

function _extractComplementaryCertificationLabelsFromLine(line) {
  const complementaryCertificationLabels = [];

  Object.keys(line).map((header) => {
    if (_isComplementaryCertification(header)) {
      const complementaryCertificationValue = line[header];
      if (_isTrueValue(complementaryCertificationValue)) {
        complementaryCertificationLabels.push(
          _getComplementaryCertificationLabel(header, COMPLEMENTARY_CERTIFICATION_SUFFIX),
        );
      }
    }
  });
  return complementaryCertificationLabels;
}

function _isTrueValue(complementaryCertificationValue) {
  const TRUE_VALUE = 'OUI';
  return complementaryCertificationValue?.trim().toUpperCase() === TRUE_VALUE;
}

function _isComplementaryCertification(header) {
  return header.endsWith(COMPLEMENTARY_CERTIFICATION_SUFFIX);
}

function _getComplementaryCertificationLabel(key, COMPLEMENTARY_CERTIFICATION_SUFFIX) {
  return key.replace(COMPLEMENTARY_CERTIFICATION_SUFFIX, '').trim();
}

function _verifiyFileIntegrity({
  firstCsvLine,
  hasBillingMode,
  csvBillingModeKey,
  csvPrepaymentCodeKey,
  expectedHeadersKeys,
}) {
  if (
    _isCsvEmpty(firstCsvLine) ||
    _isScoAndHasBillingModeColumnsInCsv({
      hasBillingMode,
      firstCsvLine,
      csvBillingModeKey,
      csvPrepaymentCodeKey,
    })
  ) {
    throw new FileValidationError('CSV_HEADERS_NOT_VALID');
  }

  _verifyHeaders({ expectedHeadersKeys, headers, firstCsvLine, hasBillingMode });
}

function _verifyHeaders({ expectedHeadersKeys, firstCsvLine, headers, hasBillingMode }) {
  expectedHeadersKeys.forEach((key) => {
    const matchingCsvColumnValue = firstCsvLine[headers[key]];

    if (_missingCsvColumn(matchingCsvColumnValue)) {
      if (_isBillingModeOptionalAndAssociatedColumnsMissing(key, hasBillingMode)) {
        return;
      }

      throw new FileValidationError('CSV_HEADERS_NOT_VALID');
    }
  });
}

function _isScoAndHasBillingModeColumnsInCsv({
  hasBillingMode,
  firstCsvLine,
  csvBillingModeKey,
  csvPrepaymentCodeKey,
}) {
  return !hasBillingMode && (csvBillingModeKey in firstCsvLine || csvPrepaymentCodeKey in firstCsvLine);
}

function _missingCsvColumn(matchingCsvColumnValue) {
  return matchingCsvColumnValue === undefined;
}

function _isBillingModeOptionalAndAssociatedColumnsMissing(key, hasBillingMode) {
  return (key === 'billingMode' || key === 'prepaymentCode') && !hasBillingMode;
}

function _hasSessionInformation({ address, room, date, time, examiner }) {
  return Boolean(address) || Boolean(room) || Boolean(date) || Boolean(time) || Boolean(examiner);
}

function _hasCandidateInformation({ lastName, firstName, birthdate, sex, billingMode, birthCountry }) {
  return (
    Boolean(lastName) ||
    Boolean(firstName) ||
    Boolean(birthdate) ||
    Boolean(sex) ||
    Boolean(billingMode) ||
    Boolean(birthCountry)
  );
}

function _createSession({ sessionId, address, room, date, time, examiner, description, line }) {
  const uniqueKey = _generateUniqueKey({ address, room, date, time });

  return {
    sessionId: sessionId ? sessionId : undefined,
    uniqueKey,
    address,
    room,
    date,
    time: time ? time : null,
    examiner: examiner ? [examiner] : [],
    description,
    line,
    certificationCandidates: [],
  };
}

function _createCandidate({
  lastName,
  firstName,
  birthdate,
  birthINSEECode,
  birthPostalCode,
  birthCity,
  birthCountry,
  resultRecipientEmail,
  email,
  externalId,
  extraTimePercentage,
  billingMode,
  prepaymentCode,
  sex,
  complementaryCertifications,
  line,
}) {
  return {
    lastName,
    firstName,
    birthdate,
    birthINSEECode,
    birthPostalCode,
    birthCity,
    birthCountry,
    resultRecipientEmail,
    email,
    externalId,
    extraTimePercentage,
    billingMode,
    prepaymentCode,
    sex,
    complementaryCertifications,
    line,
  };
}

function _generateUniqueKey({ address, room, date, time }) {
  return address + room + date + time;
}

function _isCsvEmpty(firstCsvLine) {
  return !firstCsvLine;
}

function serializeLine(lineArray) {
  return lineArray.map(_csvSerializeValue).join(';') + '\n';
}

export {
  serializeLine,
  deserializeForSessionsImport,
  deserializeForOrganizationsImport,
  deserializeForCampaignsImport,
  parseForCampaignsImport,
};
