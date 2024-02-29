const TABLE_NAME_REGEXP = /(?<=insert into\s)(?<tableName>(".*"))(?=\s\(.*)/i;

export function getTableNameFromInsertSqlQuery(insertSqlQuery) {
  const tableName = TABLE_NAME_REGEXP.exec(insertSqlQuery)?.groups?.tableName?.replaceAll('"', '');
  return tableName;
}
