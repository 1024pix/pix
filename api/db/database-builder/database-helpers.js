const TABLE_NAME_REGEXP = /insert into\s+(?<tableName>"[^"]+"(\."[^"]+")?)/i;

export function getTableNameFromInsertSqlQuery(insertSqlQuery) {
  return TABLE_NAME_REGEXP.exec(insertSqlQuery)?.groups?.tableName?.replaceAll('"', '');
}
