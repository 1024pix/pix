const _ = require('lodash');
const moment = require('moment');

const ATTENDANCE_SHEET_CANDIDATES_TABLE_HEADERS = [
  {
    header: 'NOM',
    property: 'lastName',
    transformFn: _toNotEmptyStringOrNull,
  },
  {
    header: 'Date de naissance (format : jj/mm/aaaa)',
    property: 'birthdate',
    transformFn: (cellVal) => {
      if (cellVal && moment(cellVal).isValid()) {
        return moment(cellVal).format('YYYY-MM-DD');
      }
      return null;
    },
  },
  {
    header: 'Prénom',
    property: 'firstName',
    transformFn: _toNotEmptyStringOrNull,
  },
  {
    header: 'Lieu de naissance',
    property: 'birthplace',
    transformFn: _toNotEmptyStringOrNull,
  },
  {
    header: 'Identifiant local',
    property: 'externalId',
    transformFn: _toNotEmptyStringOrNull,
  },
  {
    header: 'Temps majoré ?',
    property: 'extraTimePercentage',
    transformFn: _toNonZeroValueOrNull,
  },
];

// TODO LAURA renommer
const ATTENDANCE_SHEET_HEADERS_AND_TRANSFORM_FUNCTIONS_ADMIN = [
  {
    header: 'NOM',
    property: 'lastName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Date de naissance (format : jj/mm/aaaa)',
    property: 'birthdate',
    transformFn: (cellVal) => {
      if (cellVal && moment(cellVal).isValid()) {
        return moment(cellVal).format('DD/MM/YYYY');
      }
      return null;
    },
  },
  {
    header: 'Prénom',
    property: 'firstName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Lieu de naissance',
    property: 'birthplace',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Identifiant local',
    property: 'externalId',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Temps majoré ?',
    property: 'extraTime',
    transformFn: _toNonZeroValueOrNull,
  },
  {
    header: 'Adresse électronique de convocation',
    property: 'email',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Signature',
    property: 'signature',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Numéro de certification\n(sans le #)',
    property: 'certificationId',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Ecran de fin de test vu\n(cocher)',
    property: 'lastScreen',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Commentaires / Signalements\n(test non achevé, incident technique, fraude, etc.)\nà compléter par un rapport si nécessaire',
    property: 'comments',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
];

function _toNotEmptyStringOrNull(val) {
  const value = _.toString(val);
  return _.isEmpty(value) ? null : value;
}

function _toNotEmptyTrimmedStringOrNull(val) {
  const value = _.toString(val);
  const trimmedValue = _.trim(value);
  return _.isEmpty(trimmedValue) ? null : value;
}

function _toNonZeroValueOrNull(val) {
  const value = _.toNumber(val);
  return _.isNaN(value) ? null : (value === 0 ? null : value);
}

module.exports = {
  ATTENDANCE_SHEET_CANDIDATES_TABLE_HEADERS,
  ATTENDANCE_SHEET_HEADERS_AND_TRANSFORM_FUNCTIONS_ADMIN,
};
