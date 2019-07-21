const odsService = require('../services/ods-service');
const { InvalidCertificationCandidateData, UserNotAuthorizedToAccessEntity } = require('../errors');
const CertificationCandidate = require('../models/CertificationCandidate');
const _ = require('lodash');

const TABLEHEADER_CANDIDATEPROPERTY_MAP = [
  {
    header: 'NOM',
    property: 'lastName',
  },
  {
    header: 'Prénom',
    property: 'firstName',
  },
  {
    header: 'Date de naissance (format : jj/mm/aaaa)',
    property: 'birthdate',
  },
  {
    header: 'Lieu de naissance',
    property: 'birthCity',
  },
  {
    header: 'Identifiant local',
    property: 'externalId',
  },
  {
    header: 'Temps majoré ?',
    property: 'extraTimePercentage',
  },
];

module.exports = parseCertificationCandidatesFromAttendanceSheet;

async function parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, sessionRepository, odsBuffer }) {

  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  } catch (err) {
    throw new UserNotAuthorizedToAccessEntity(sessionId);
  }

  let certificationCandidatesData;
  try {
    certificationCandidatesData = await odsService.extractTableDataFromOdsFile(
      {
        odsBuffer,
        tableHeaderPropertyMap: TABLEHEADER_CANDIDATEPROPERTY_MAP,
      });
  }
  catch (error) {
    throw (error);
  }

  certificationCandidatesData = _filterOutEmptyCandidateData(certificationCandidatesData);
  const certificationCandidates = _.map(certificationCandidatesData, (certificationCandidateData) => {
    return new CertificationCandidate(certificationCandidateData);
  });

  const isValidationOk = _.every(certificationCandidates, _validateCertificationCandidate);
  if (!isValidationOk)
  {
    throw new InvalidCertificationCandidateData();
  }
  return certificationCandidates;
}

function _validateCertificationCandidate(certificationCandidate) {
  if (!_areMandatoryFieldsSet(certificationCandidate, ['lastName', 'firstName', 'birthdate', 'birthCity'])) {
    return false;
  }
  const candidateFieldTypes = {
    lastName: 'string',
    firstName: 'string',
    birthdate: 'date',
    birthCity: 'string',
    externalId: 'string',
    extraTimePercentage: 'number',
  };
  if (!_areValuesOfRightType({ object: certificationCandidate, fieldTypes: candidateFieldTypes, tryToCast: true })) {
    return false;
  }

  return true;
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  const emptyCertificationCandidate = new CertificationCandidate({
    lastName: null,
    firstName: null,
    birthdate: null,
    birthCity: null,
    externalId: null,
    extraTimePercentage: null,
  });
  const emptyCertificationCandidatesData = _.filter(certificationCandidatesData, (certificationCandidateData) => {
    return _.every(emptyCertificationCandidate, (value, prop) => {
      return certificationCandidateData[prop] === value;
    });
  });
  return _.difference(certificationCandidatesData, emptyCertificationCandidatesData);
}

function _areMandatoryFieldsSet(object, mandatoryFields)
{
  return _.every(object, (value, field) => {
    if (_.includes(mandatoryFields, field))
    {
      return !_.isNull(value);
    }
    return true;
  });
}

function _areValuesOfRightType({ object, fieldTypes, tryToCast }) {
  return _.every(object, (value, field) => {
    if (_.has(fieldTypes, field)) {
      let success, castedValue;
      switch (fieldTypes[field])
      {
        case 'boolean':
          [ success, castedValue ] = _validateBooleanValue({ value, tryToCast });
          break;
        case 'number':
          [ success, castedValue ] = _validateNumberValue({ value, tryToCast });
          break;
        case 'string':
          [ success, castedValue ] = _validateStringValue({ value, tryToCast });
          break;
        case 'date':
          [ success, castedValue ] = _validateDateValue({ value, tryToCast });
          break;
        default:
          success = true;
          castedValue = value;
          break;
      }
      if (success && tryToCast)
      {
        object[field] = castedValue;
      }
      return success;
    }
    return true;
  });
}

function _validateBooleanValue({ value, tryToCast })
{
  let castedValue = value;
  if (!_.isBoolean(value)) {
    if (tryToCast) {
      castedValue = Boolean(value);
    }
    else {
      return [false, value];
    }
  }
  return [true, castedValue];
}

function _validateNumberValue({ value, tryToCast })
{
  let castedValue = value;
  if (!_.isNumber(value)) {
    if (tryToCast) {
      castedValue = _.toNumber(value);
      if (_.isNaN(castedValue)) {
        return [false, value];
      }
    }
    else {
      return [false, value];
    }
  }
  return [true, castedValue];
}

function _validateStringValue({ value, tryToCast })
{
  let castedValue = value;
  if (!_.isString(value)) {
    if (tryToCast) {
      castedValue = _.toString(value);
    }
    else {
      return [false, value];
    }
  }
  return [true, castedValue];
}

function _validateDateValue({ value, tryToCast })
{
  let castedValue = value;
  if (!_.isDate(value)) {
    if (tryToCast) {
      castedValue = Date.parse(value);
      if (_.isNaN(castedValue)) {
        return [false, value];
      }
    }
    else {
      return [false, value];
    }
  }
  return [true, castedValue];
}
