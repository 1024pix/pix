const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'method';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.text(COLUMN_NAME);
  });

  const [nbRows] = await knex('pg_class').where({ relname: 'assessments' }).pluck('reltuples');
  const maxRowCountForUpdate = 650000;
  const canFillColumn = nbRows < maxRowCountForUpdate;

  if (canFillColumn) {
    await knex(TABLE_NAME).update({
      [COLUMN_NAME]: knex.raw(`
      CASE "type"
        when 'COMPETENCE_EVALUATION' then 'SMART_RANDOM'
        when 'CAMPAIGN' then 'SMART_RANDOM'
        when 'PLACEMENT' then 'SMART_RANDOM'
        when 'CERTIFICATION' then 'CERTIFICATION_DETERMINED'
        when 'DEMO' then 'COURSE_DETERMINED'
        when 'PREVIEW' then 'CHOSEN'
      END
    `),
    });
  }
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
