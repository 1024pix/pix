const _ = require('lodash');
const { convertDateValue } = require('../../utils/date-utils.js');
const {
  CLEA,
  PIX_PLUS_DROIT,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} = require('../../../domain/models/ComplementaryCertification.js');

// These are transformation structures. They provide all the necessary info
// on how to transform cell values in an attendance sheet into a target JS object.
// Such a structure is an array holding objects with 3 properties. One object
// represents the transformation formula for one specific column in the ods file.
// Those 3 properties are:
//  - header -> Header in the ods file under which the cell values will be found
//  - property -> Property name of the target object in which the value will be put
//  - transformFn -> Transformation function through which the cell value will be processed into the final value
const _getTransformationsStructs = (translate) => [
  {
    header: translate('candidate-list-template.headers.birthname'),
    property: 'lastName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.firstname'),
    property: 'firstName',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.externalid'),
    property: 'externalId',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.extratime'),
    property: 'extraTimePercentage',
    transformFn: _toNonZeroValueOrNull,
  },
  {
    header: translate('candidate-list-template.headers.birth-date'),
    property: 'birthdate',
    transformFn: (cellVal) => {
      return convertDateValue({ dateString: cellVal, inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' });
    },
  },
  {
    header: translate('candidate-list-template.headers.birthcity'),
    property: 'birthCity',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.birthcity-postcode'),
    property: 'birthPostalCode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.birthcity-inseecode'),
    property: 'birthINSEECode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.birthcountry'),
    property: 'birthCountry',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.email-convocation'),
    property: 'email',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.email-results'),
    property: 'resultRecipientEmail',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
  {
    header: translate('candidate-list-template.headers.gender'),
    property: 'sex',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  },
];

let translate;

// ALL
function getTransformationStructsForPixCertifCandidatesImport({ i18n, complementaryCertifications, isSco }) {
  translate = i18n.__;
  const TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT = _getTransformationsStructs(translate);
  const transformationStruct = [...TRANSFORMATION_STRUCT_FOR_PIX_CERTIF_CANDIDATES_IMPORT];

  _includeComplementaryCertificationColumns({ complementaryCertifications, transformationStruct });

  if (!isSco) {
    _includeBillingColumns({ transformationStruct });
  }

  return {
    transformStruct: transformationStruct,
    headers: _getHeadersFromTransformationStruct(transformationStruct),
  };
}

function _includeComplementaryCertificationColumns({ complementaryCertifications, transformationStruct }) {
  const containsClea = complementaryCertifications.some(
    (complementaryCertification) => complementaryCertification.key === CLEA
  );
  const containsPixPlusDroit = complementaryCertifications.some(
    (complementaryCertification) => complementaryCertification.key === PIX_PLUS_DROIT
  );
  const containsPixPlusEdu1erDegre = complementaryCertifications.some(
    (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_1ER_DEGRE
  );
  const containsPixPlusEdu2ndDegre = complementaryCertifications.some(
    (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_2ND_DEGRE
  );

  if (containsClea) {
    transformationStruct.push({
      header: 'CléA Numérique' + translate('candidate-list-template.yes-or-empty') + '',
      property: 'hasCleaNumerique',
      transformFn: _toBooleanIfValueEqualsOuiOrNull,
    });
  }

  if (containsPixPlusDroit) {
    transformationStruct.push({
      header: 'Pix+ Droit' + translate('candidate-list-template.yes-or-empty') + '',
      property: 'hasPixPlusDroit',
      transformFn: _toBooleanIfValueEqualsOuiOrNull,
    });
  }

  if (containsPixPlusEdu1erDegre) {
    transformationStruct.push({
      header: 'Pix+ Édu 1er degré' + translate('candidate-list-template.yes-or-empty') + '',
      property: 'hasPixPlusEdu1erDegre',
      transformFn: _toBooleanIfValueEqualsOuiOrNull,
    });
  }

  if (containsPixPlusEdu2ndDegre) {
    transformationStruct.push({
      header: 'Pix+ Édu 2nd degré' + translate('candidate-list-template.yes-or-empty') + '',
      property: 'hasPixPlusEdu2ndDegre',
      transformFn: _toBooleanIfValueEqualsOuiOrNull,
    });
  }
}

function _includeBillingColumns({ transformationStruct }) {
  transformationStruct.push({
    header: translate('candidate-list-template.pricing-pix'),
    property: 'billingMode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  });
  transformationStruct.push({
    header: translate('candidate-list-template.prepayment'),
    property: 'prepaymentCode',
    transformFn: _toNotEmptyTrimmedStringOrNull,
  });
}

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

function _toBooleanIfValueEqualsOuiOrNull(val) {
  const yesTranslation = translate('candidate-list-template.yes');

  return _.toUpper(val) === yesTranslation.toUpperCase() ? true : null;
}

module.exports = {
  getTransformationStructsForPixCertifCandidatesImport,
};
