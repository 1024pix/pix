import {
  PIX_PLUS_DROIT,
  CLEA,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} from '../../../domain/models/ComplementaryCertification';

const IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES = [
  {
    placeholder: 'SESSION_ID',
    propertyName: 'id',
  },
  {
    placeholder: 'SESSION_START_DATE',
    propertyName: 'date',
  },
  {
    placeholder: 'SESSION_START_TIME',
    propertyName: 'startTime',
  },
  {
    placeholder: 'SESSION_END_TIME',
    propertyName: 'endTime',
  },
  {
    placeholder: 'SESSION_ADDRESS',
    propertyName: 'address',
  },
  {
    placeholder: 'SESSION_ROOM',
    propertyName: 'room',
  },
  {
    placeholder: 'SESSION_EXAMINER',
    propertyName: 'examiner',
  },
];

const IMPORT_CANDIDATES_TEMPLATE_VALUES = [
  {
    placeholder: 'COUNT',
    propertyName: 'count',
  },
  {
    placeholder: 'LAST_NAME',
    propertyName: 'lastName',
  },
  {
    placeholder: 'FIRST_NAME',
    propertyName: 'firstName',
  },
  {
    placeholder: '01/01/1900',
    propertyName: 'birthdate',
  },
  {
    placeholder: 'SEX',
    propertyName: 'sex',
  },
  {
    placeholder: 'BIRTH_POSTAL_CODE',
    propertyName: 'birthPostalCode',
  },
  {
    placeholder: 'BIRTH_INSEE_CODE',
    propertyName: 'birthINSEECode',
  },
  {
    placeholder: 'BIRTH_CITY',
    propertyName: 'birthCity',
  },
  {
    placeholder: 'BIRTH_PROVINCE_CODE',
    propertyName: 'birthProvinceCode',
  },
  {
    placeholder: 'BIRTH_COUNTRY',
    propertyName: 'birthCountry',
  },
  {
    placeholder: 'RESULT_RECIPIENT@EXAMPLE.FR',
    propertyName: 'resultRecipientEmail',
  },
  {
    placeholder: 'CONVOCATION@EXAMPLE.FR',
    propertyName: 'email',
  },
  {
    placeholder: 'EXTERNAL_ID',
    propertyName: 'externalId',
  },
  {
    placeholder: '999 %',
    propertyName: 'extraTimePercentage',
  },
  {
    placeholder: 'billingMode',
    propertyName: 'billingMode',
    validator: 'billingModeValidator',
  },
  {
    placeholder: 'prepaymentCode',
    propertyName: 'prepaymentCode',
    validator: 'val-prepayment-code',
  },
  {
    placeholder: CLEA,
    propertyName: 'cleaNumerique',
  },
  {
    placeholder: PIX_PLUS_DROIT,
    propertyName: 'pixPlusDroit',
  },
  {
    placeholder: PIX_PLUS_EDU_1ER_DEGRE,
    propertyName: 'pixPlusEdu1erDegre',
  },
  {
    placeholder: PIX_PLUS_EDU_2ND_DEGRE,
    propertyName: 'pixPlusEdu2ndDegre',
  },
];

const EXTRA_EMPTY_CANDIDATE_ROWS = 20;

export default {
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  EXTRA_EMPTY_CANDIDATE_ROWS,
};
