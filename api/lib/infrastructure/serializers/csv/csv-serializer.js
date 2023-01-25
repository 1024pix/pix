const logger = require('../../logger');
const { FileValidationError } = require('../../../../lib/domain/errors');
const { convertDateValue } = require('../../utils/date-utils');
const { headers } = require('../../utils/csv/sessions-import');

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
    const data = getDataFromColumnNames({ csvLineKeys, headers, line });

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

function getDataFromColumnNames({ csvLineKeys, headers, line }) {
  const data = {};
  csvLineKeys.forEach((key) => {
    if (key === 'birthdate' || key === 'date') {
      data[key] = convertDateValue({
        dateString: line[headers[key]],
        inputFormat: 'DD/MM/YYYY',
        outputFormat: 'YYYY-MM-DD',
      });
    } else if (key === 'extraTimePercentage') {
      data[key] = line[headers[key]] !== '' ? parseInt(line[headers[key]]) : null;
    } else {
      data[key] = line[headers[key]];
    }
  });
  return data;
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
