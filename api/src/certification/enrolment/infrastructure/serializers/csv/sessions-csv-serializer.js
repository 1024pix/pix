import { FileValidationError } from '../../../../../shared/domain/errors.js';
import { convertDateValue } from '../../../../../shared/infrastructure/utils/date-utils.js';
import {
  COMPLEMENTARY_CERTIFICATION_SUFFIX,
  emptySession,
  headers,
} from '../../../../shared/infrastructure/utils/csv/sessions-import.js';

function deserializeForSessionsImport({ parsedCsvData, hasBillingMode, certificationCenterHabilitations }) {
  const sessions = [];
  const expectedHeadersKeys = Object.keys(headers);

  const csvBillingModeKey = headers.billingMode;
  const csvPrepaymentCodeKey = headers.prepaymentCode;

  _verifiyFileIntegrity({
    parsedCsvData,
    hasBillingMode,
    csvBillingModeKey,
    csvPrepaymentCodeKey,
    expectedHeadersKeys,
    certificationCenterHabilitations,
  });

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
          candidates: [],
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
      currentParsedSession.candidates.push(_createCandidate(data, certificationCenterHabilitations));
    }
  });

  return sessions.map((session) => ({
    ...session,
    examiner: session.examiner ? session.examiner.join(', ') : '',
  }));
}

function _hasSessionIdAndCandidateInformation(data) {
  return _hasCandidateInformation(data) && data.sessionId;
}

function _getDataFromColumnNames({ expectedHeadersKeys, headers, line }) {
  const data = {};
  data.complementarySubscriptionLabels = _extractComplementaryCertificationLabelsFromLine(line);

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

function _validateComplementaryCertificationHeaders(headers, certificationCenterHabilitations) {
  const habilitationsLabels = certificationCenterHabilitations.map(({ label }) => label);
  const hasCertificationCenterNecessaryHabilitations = headers.every((header) => habilitationsLabels.includes(header));

  if (!hasCertificationCenterNecessaryHabilitations) {
    throw new FileValidationError('CSV_HEADERS_NOT_VALID');
  }
}

function _verifiyFileIntegrity({
  parsedCsvData,
  hasBillingMode,
  csvBillingModeKey,
  csvPrepaymentCodeKey,
  certificationCenterHabilitations,
}) {
  const firstCsvLine = parsedCsvData[0];
  if (
    _isScoAndHasBillingModeColumnsInCsv({
      hasBillingMode,
      firstCsvLine,
      csvBillingModeKey,
      csvPrepaymentCodeKey,
    })
  ) {
    throw new FileValidationError('CSV_HEADERS_NOT_VALID');
  }

  const complementaryCertificationHeaders = _extractComplementaryCertificationLabelsFromLine(firstCsvLine);
  if (complementaryCertificationHeaders && certificationCenterHabilitations) {
    _validateComplementaryCertificationHeaders(complementaryCertificationHeaders, certificationCenterHabilitations);
  }

  _verifyColumnsValueAgainstConstraints({ csvLines: parsedCsvData, headers, hasBillingMode });
}

function _verifyColumnsValueAgainstConstraints({ csvLines, headers, hasBillingMode }) {
  for (const key in headers) {
    if (!hasBillingMode && (key === 'billingMode' || key === 'prepaymentCode')) {
      break;
    }

    if (csvLines.map((line) => line[headers[key]]).some((e) => e === undefined)) {
      throw new FileValidationError('CSV_DATA_REQUIRED');
    }
  }
}

function _isScoAndHasBillingModeColumnsInCsv({
  hasBillingMode,
  firstCsvLine,
  csvBillingModeKey,
  csvPrepaymentCodeKey,
}) {
  return !hasBillingMode && (csvBillingModeKey in firstCsvLine || csvPrepaymentCodeKey in firstCsvLine);
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
    candidates: [],
  };
}

function _createCandidate(
  {
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
    complementarySubscriptionLabels,
    line,
  },
  certificationCenterHabilitations,
) {
  const subscriptionKeys = certificationCenterHabilitations
    ? certificationCenterHabilitations
        .filter(({ label }) => complementarySubscriptionLabels.includes(label))
        .map(({ key }) => key)
    : [];

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
    subscriptionKeys,
    line,
  };
}

function _generateUniqueKey({ address, room, date, time }) {
  return address + room + date + time;
}

export const sessionsCsvSerializer = { deserializeForSessionsImport };
