const logger = require('../../../infrastructure/logger');

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
  parsedCsvData.forEach((line) => {
    const data = {
      address: line['* Nom du site'],
      room: line['* Nom de la salle'],
      date: line['* Date de début'],
      time: line['* Heure de début (heure locale)'],
      examiner: line['* Surveillant(s)'],
      description: line['Observations (optionnel)'],
      lastName: line['* Nom de naissance'],
      firstName: line['* Prénom'],
      birthdate: line['* Date de naissance (format: jj/mm/aaaa)'],
      sex: line['* Sexe (M ou F)'],
      birthINSEECode: line['Code Insee'],
      birthPostalCode: line['Code postal'],
      birthCity: line['Nom de la commune'],
      birthCountry: line['* Pays'],
      resultRecipientEmail: line['E-mail du destinataire des résultats (formateur, enseignant…)'],
      email: line['E-mail de convocation'],
      externalId: line['Identifiant local'],
      extraTimePercentage: line['Temps majoré ?'],
      billingMode: line['Tarification part Pix'] ?? null,
      prepaymentCode: line['Code de prépaiement'] ?? null,
    };

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

    if (_hasCandidateInformation(data)) {
      existingSession.certificationCandidates.push(_createCandidate(data));
    }
  });

  return sessions;
}

function _hasSessionInformation({ room }) {
  return Boolean(room);
}

function _hasCandidateInformation({ lastName }) {
  return Boolean(lastName);
}

function _createSession({ address, room, date, time, examiner, description }) {
  const uniqueKey = _generateUniqueKey({ address, room, date, time, examiner });

  return {
    uniqueKey,
    address,
    room,
    date,
    time,
    examiner,
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

function _generateUniqueKey({ address, room, date, time, examiner }) {
  return address + room + date + time + examiner;
}

module.exports = {
  serializeLine(lineArray) {
    return lineArray.map(_csvSerializeValue).join(';') + '\n';
  },
  deserializeForSessionsImport,
};
