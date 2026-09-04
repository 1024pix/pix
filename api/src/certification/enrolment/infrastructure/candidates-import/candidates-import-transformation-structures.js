import { convertDateValue } from '../../../../shared/infrastructure/utils/date-utils.js';
import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';

// These are transformation structures. They provide all the necessary info
// on how to transform cell values in an attendance sheet into a target JS object.
// Such a structure is an array holding objects with 3 properties. One object
// represents the transformation formula for one specific column in the ods file.
// Those 3 properties are:
//  - header -> Header in the ods file under which the cell values will be found
//  - property -> Property name of the target object in which the value will be put
//  - transformFn -> Transformation function through which the cell value will be processed into the final value
function _getTransformationsStruct(translate) {
  return [
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
      header: translate('candidate-list-template.headers.extra-time'),
      property: 'extraTimePercentage',
      transformFn: _toNonZeroValueOrNull,
    },
    {
      header: translate('candidate-list-template.headers.birth-date'),
      property: 'birthdate',
      transformFn: (cellVal) => {
        return convertDateValue({ dateString: cellVal, inputFormat: 'DD/MM/YYYY' });
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
}

export function getTransformationStructsForPixCertifCandidatesImport({ i18n, habilitations, isSco }) {
  const translate = i18n.__;
  const transformationStruct = _getTransformationsStruct(translate);

  _includeHabilitationColumns({ habilitations, transformationStruct, translate });

  if (!isSco) {
    _includeBillingColumns({ transformationStruct, translate });
  }

  return {
    transformStruct: transformationStruct,
    headers: _getHeadersFromTransformationStruct(transformationStruct),
  };
}

function _includeHabilitationColumns({ habilitations, transformationStruct, translate }) {
  habilitations.forEach((habilitation) => {
    transformationStruct.push({
      header: `${habilitation.label}${translate('candidate-list-template.yes-or-empty')}`,
      property: habilitation.key,
      transformFn: (val) => _toBooleanIfValueEqualsOuiOrNull({ val, translate }),
    });
  });
}

function _includeBillingColumns({ transformationStruct, translate }) {
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
  const value = String(val ?? '');
  const trimmedValue = value.trim();
  return isEmpty(trimmedValue) ? null : trimmedValue;
}

function _toNonZeroValueOrNull(val) {
  const value = Number(val);
  return Number.isNaN(value) ? null : value === 0 ? null : value;
}

function _getHeadersFromTransformationStruct(transformationStruct) {
  return transformationStruct.map((ts) => ts.header);
}

function _toBooleanIfValueEqualsOuiOrNull({ val, translate }) {
  const yesTranslation = translate('candidate-list-template.yes');

  return val?.toUpperCase() === yesTranslation.toUpperCase() ? true : null;
}
