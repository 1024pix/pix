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
    transformFn: _toNonZeroValueOrNull
  },
];

function _toNotEmptyStringOrNull(val) {
  const value = _.toString(val);
  return _.isEmpty(value) ? null : value;
}

function _toNonZeroValueOrNull(val) {
  const value = _.toNumber(val);
  return _.isNaN(value) ? null : (value === 0 ? null : value);
}

module.exports = {
  ATTENDANCE_SHEET_CANDIDATES_TABLE_HEADERS,
};
