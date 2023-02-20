const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME_NAME = 'name';
const COLUMN_NAME_LABEL = 'label';
const COLUMN_NAME_KEY = 'key';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME_KEY);
  });

  await knex(TABLE_NAME).where({ name: 'Pix+ Droit' }).update({ key: 'DROIT' });
  await knex(TABLE_NAME).where({ name: 'CléA Numérique' }).update({ key: 'CLEA' });
  await knex(TABLE_NAME).where({ name: 'Pix+ Édu 1er degré' }).update({ key: 'EDU_1ER_DEGRE' });
  await knex(TABLE_NAME).where({ name: 'Pix+ Édu 2nd degré' }).update({ key: 'EDU_2ND_DEGRE' });

  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME_KEY).notNullable().alter();
    table.renameColumn(COLUMN_NAME_NAME, COLUMN_NAME_LABEL);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME_KEY);
    table.renameColumn(COLUMN_NAME_LABEL, COLUMN_NAME_NAME);
  });
};
