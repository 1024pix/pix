const logger = require('../../logger.js');
const { FileValidationError } = require('../../../../lib/domain/errors.js');
const { convertDateValue } = require('../../utils/date-utils.js');
const { headers, emptySession, COMPLEMENTARY_CERTIFICATION_SUFFIX } = require('../../utils/csv/sessions-import.js');
const { isEmpty } = require('lodash');
const { checkCsvHeader, parseCsvWithHeader } = require('../../helpers/csv.js');

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

function deserializeForSessionsImport(parsedCsvData) {
  const sessions = [];
  const csvLineKeys = Object.keys(headers);

  _verifyHeaders({ csvLineKeys, headers, parsedCsvLine: parsedCsvData[0] });

  parsedCsvData.forEach((lineDTO, index) => {
    const dataFromColumnName = _getDataFromColumnNames({ csvLineKeys, headers, line: lineDTO });
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

function _hasSessionIdAndCandidateInformation(data) {
  return _hasCandidateInformation(data) && data.sessionId;
}

function _getDataFromColumnNames({ csvLineKeys, headers, line }) {
  const data = {};
  data.complementaryCertifications = _extractComplementaryCertificationLabelsFromLine(line);

  csvLineKeys.forEach((key) => {
    const headerKeyInCurrentLine = line[headers[key]];
    if (key === 'birthdate' || key === 'date') {
      data[key] = convertDateValue({
        dateString: headerKeyInCurrentLine,
        inputFormat: 'DD/MM/YYYY',
        outputFormat: 'YYYY-MM-DD',
      });
    } else if (key === 'extraTimePercentage') {
      data[key] = headerKeyInCurrentLine !== '' ? headerKeyInCurrentLine : null;
    } else if (key === 'prepaymentCode') {
      data[key] = headerKeyInCurrentLine !== '' ? headerKeyInCurrentLine : null;
    } else {
      data[key] = headerKeyInCurrentLine;
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
        const complementaryCertificationLabel = _getComplementaryCertificationLabel(
          header,
          COMPLEMENTARY_CERTIFICATION_SUFFIX
        );

        complementaryCertificationLabels.push(complementaryCertificationLabel);
      }
    }
  });

  return complementaryCertificationLabels;
}

function _isTrueValue(complementaryCertificationValue) {
  const TRUE_VALUE = 'OUI';
  return complementaryCertificationValue.trim().toUpperCase() === TRUE_VALUE;
}

function _isComplementaryCertification(header) {
  return header.endsWith(COMPLEMENTARY_CERTIFICATION_SUFFIX);
}

function _getComplementaryCertificationLabel(key, COMPLEMENTARY_CERTIFICATION_SUFFIX) {
  return key.replace(COMPLEMENTARY_CERTIFICATION_SUFFIX, '').trim();
}

function _verifyHeaders({ csvLineKeys, parsedCsvLine, headers }) {
  csvLineKeys.forEach((key) => {
    if (parsedCsvLine[headers[key]] === undefined) {
      throw new FileValidationError(`La colonne : ${headers[key]} est absente du fichier`);
    }
  });
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
    time,
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

function serializeLine(lineArray) {
  return lineArray.map(_csvSerializeValue).join(';') + '\n';
}

module.exports = {
  serializeLine,
  deserializeForSessionsImport,
  deserializeForOrganizationsImport,
};
