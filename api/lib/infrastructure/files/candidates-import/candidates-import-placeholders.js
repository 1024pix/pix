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
];

const EXTRA_EMPTY_CANDIDATE_ROWS = 20;

module.exports = {
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  EXTRA_EMPTY_CANDIDATE_ROWS,
};
