const TABLE_NAME = 'complementary-certifications';
const COLUMN = 'minimumReproducibilityRate';

export const up = async function (knex) {
  await knex(TABLE_NAME).update({ minimumReproducibilityRate: 50.0, minimumEarnedPix: 70 }).where({ key: 'CLEA' });

  await knex(TABLE_NAME).update(COLUMN, 75.0).where({ key: 'DROIT' });
  await knex(TABLE_NAME).update(COLUMN, 70.0).where({ key: 'EDU_1ER_DEGRE' });
  await knex(TABLE_NAME).update(COLUMN, 70.0).where({ key: 'EDU_2ND_DEGRE' });

  await knex.schema.alterTable(TABLE_NAME, async (table) => {
    await table.decimal(COLUMN, 5, 2).notNullable().alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, async (table) => {
    await table.decimal(COLUMN, 5, 2).nullable().alter();
  });

  await knex(TABLE_NAME).update(COLUMN, null).whereIn('key', ['DROIT', 'EDU_1ER_DEGRE', 'EDU_2ND_DEGRE']);
};
