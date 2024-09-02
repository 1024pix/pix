const COLUMN_KEY_FIELD = {
  COMMON_BIRTHDATE: 'common.import.field.birthdate',
  COMMON_DIVISION: 'common.import.field.division',
};

export function getColumnName(heading) {
  const columnKey = COLUMN_KEY_FIELD[heading];

  if (!columnKey) return heading;

  return columnKey;
}
