const COLUMN_KEY_FIELD: Record<string, string> = {
  COMMON_BIRTHDATE: 'common.import.field.birthdate',
  COMMON_DIVISION: 'common.import.field.division',
  ORALIZATION: 'common.import.field.oralization',
};

export function getColumnName(heading: string): string {
  const columnKey = COLUMN_KEY_FIELD[heading];

  if (!columnKey) return heading;

  return columnKey;
}
