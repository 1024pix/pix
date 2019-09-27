const _ = require('lodash');
const moment = require('moment');

// These are transformation structures. They provide all the necessary info
// on how to transform cell values in an attendance sheet into a target JS object.
// Such a structure is an array holding objects with 3 properties. One object
// represents the transformation formula for one specific column in the ods file.
// Those 3 properties are:
//  - header -> Header in the ods file under which the cell values will be found
//  - property -> Property name of the target object in which the value will be put
//  - transformFn -> Transformation function through which the cell value will be processed into the final value

const _TRANSFORMATION_STRUCT_COMMON = [
  {
    header: 'NOM',
    property: 'lastName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
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
    property: 'extraTimePercentage',
    transformFn: _toNonZeroValueOrNull,
  },
];

const TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT = [
  ..._TRANSFORMATION_STRUCT_COMMON,
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
];

const TRANSFORMATION_STRUCT_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING = [
  ..._TRANSFORMATION_STRUCT_COMMON,
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
  TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT,
  TRANSFORMATION_STRUCT_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING,
};
