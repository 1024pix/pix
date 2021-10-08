const _ = require('lodash');
const { convertDateValue } = require('../../utils/date-utils');

const PIX_CERTIF_CANDIDATES_IMPORT_SHEET_VERSION = '1.5';
// These are transformation structures. They provide all the necessary info
// on how to transform cell values in an attendance sheet into a target JS object.
// Such a structure is an array holding objects with 3 properties. One object
// represents the transformation formula for one specific column in the ods file.
// Those 3 properties are:
//  - header -> Header in the ods file under which the cell values will be found
//  - property -> Property name of the target object in which the value will be put
//  - transformFn -> Transformation function through which the cell value will be processed into the final value
const _TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT_V1_5 = [
  {
    header: '* Nom de naissance',
    property: 'lastName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: '* Prénom',
    property: 'firstName',
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
  {
    header: '* Date de naissance (format : jj/mm/aaaa)',
    property: 'birthdate',
    transformFn: (cellVal) => {
      return convertDateValue({ dateString: cellVal, inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' });
    },
  },
  {
    header: 'Nom de la commune',
    property: 'birthCity',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Code postal',
    property: 'birthPostalCode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Code Insee',
    property: 'birthINSEECode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'Pays',
    property: 'birthCountry',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'E-mail de convocation',
    property: 'email',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: 'E-mail du destinataire des résultats (formateur, enseignant…)',
    property: 'resultRecipientEmail',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: '* Sexe (M ou F)',
    property: 'sex',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
];

// ALL
const TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION = {
  1.5: {
    version: '1.5',
    transformStruct: _TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT_V1_5,
    headers: _getHeadersFromTransformationStruct(_TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT_V1_5),
  },
};

function _toNotEmptyTrimmedStringOrNull(val) {
  const value = _.toString(val);
  const trimmedValue = _.trim(value);
  return _.isEmpty(trimmedValue) ? null : trimmedValue;
}

function _toNonZeroValueOrNull(val) {
  const value = _.toNumber(val);
  return _.isNaN(value) ? null : value === 0 ? null : value;
}

function _getHeadersFromTransformationStruct(transformationStruct) {
  return _.map(transformationStruct, 'header');
}

module.exports = {
  PIX_CERTIF_CANDIDATES_IMPORT_SHEET_VERSION,
  TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION,
};
