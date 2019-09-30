const ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES = [
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
  {
    placeholder: 'CERTIFICATION_CENTER_NAME',
    propertyName: 'certificationCenterName',
  },
];

const ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES = [
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
    placeholder: 'BIRTHPLACE',
    propertyName: 'birthCity',
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

const EXTRA_EMPTY_CANDIDATE_ROWS = 10;

module.exports = {
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  EXTRA_EMPTY_CANDIDATE_ROWS,
};
