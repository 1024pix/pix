import { datawarehouseKnex } from '../../tests/tooling/databases.js';

const TABLE_NAME_REGEXP = /(?<=insert into\s)(?<tableName>(".*"))(?=\s\(.*)/i;

export function getTableNameFromInsertSqlQuery(insertSqlQuery) {
  return TABLE_NAME_REGEXP.exec(insertSqlQuery)?.groups?.tableName?.replaceAll('"', '');
}

export async function createCalibrationTables() {
  for (const table of tablesOrder) {
    const hasTable = await datawarehouseKnex.schema.hasTable(table);
    if (!hasTable) await datawarehouseKnex.schema.createTable(table, schemasForTable[table]);
  }
}

export async function cleanCalibrationTables() {
  const deleteFromStatements = [];
  for (const table of tablesOrder.toReversed()) {
    deleteFromStatements.push(`DELETE FROM ${table};`);
  }
  // eslint-disable-next-line knex/avoid-injections
  await datawarehouseKnex.raw(deleteFromStatements.join('\n'));
}

const tablesOrder = ['data_calibrations', 'data_calibration_challenges'];
const schemasForTable = {
  data_calibrations: (t) => {
    t.increments('id').primary();
    t.dateTime('calibration_date');
    t.string('status');
    t.string('scope');
  },
  data_calibration_challenges: (t) => {
    t.increments('id').primary();
    t.integer('calibration_id').references('data_calibrations.id');
    t.string('challenge_id');
    t.decimal('alpha', 6, 5);
    t.decimal('delta', 6, 5);
    t.boolean('is_excluded');
  },
};
