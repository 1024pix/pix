const logger = require('../../logger');
const { FileValidationError } = require('../../../../lib/domain/errors');
const { convertDateValue } = require('../../utils/date-utils');
const { headers, COMPLEMENTARY_CERTIFICATION_SUFFIX } = require('../../utils/csv/sessions-import');

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

  parsedCsvData.forEach((line) => {
    const data = _getDataFromColumnNames({ csvLineKeys, headers, line });

    let existingSession;
    if (_hasSessionInformation(data)) {
      existingSession = sessions.find((session) => session.uniqueKey === _generateUniqueKey(data));
      if (!existingSession) {
        existingSession = _createSession(data);
        sessions.push(existingSession);
      }
    } else {
      existingSession = sessions.at(-1);
    }
    const examiner = data.examiner.trim();
    if (examiner.length && !existingSession.examiner.includes(examiner)) {
      existingSession.examiner.push(examiner);
    }

    if (_hasCandidateInformation(data)) {
      existingSession.certificationCandidates.push(_createCandidate(data));
    }
  });

  return sessions.map((session) => ({
    ...session,
    examiner: session.examiner.join(', '),
  }));
}

function _getDataFromColumnNames({ csvLineKeys, headers, line }) {
  const data = {};
  data.complementaryCertifications = _extractComplementaryCertificationLabelsFromLine(line);

  csvLineKeys.forEach((key) => {
    if (key === 'birthdate' || key === 'date') {
      data[key] = convertDateValue({
        dateString: line[headers[key]],
        inputFormat: 'DD/MM/YYYY',
        outputFormat: 'YYYY-MM-DD',
      });
    } else if (key === 'extraTimePercentage') {
      data[key] = line[headers[key]] !== '' ? parseInt(line[headers[key]]) : null;
    } else if (key === 'prepaymentCode') {
      data[key] = line[headers[key]] !== '' ? line[headers[key]] : null;
    } else {
      data[key] = line[headers[key]];
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

function _hasSessionInformation({ room }) {
  return Boolean(room);
}

function _hasCandidateInformation({ lastName }) {
  return Boolean(lastName);
}

function _createSession({ address, room, date, time, examiner, description }) {
  const uniqueKey = _generateUniqueKey({ address, room, date, time });

  return {
    uniqueKey,
    address,
    room,
    date,
    time,
    examiner: examiner ? [examiner] : [],
    description,
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
  };
}

function _generateUniqueKey({ address, room, date, time }) {
  return address + room + date + time;
}

module.exports = {
  serializeLine(lineArray) {
    return lineArray.map(_csvSerializeValue).join(';') + '\n';
  },
  deserializeForSessionsImport,
};
