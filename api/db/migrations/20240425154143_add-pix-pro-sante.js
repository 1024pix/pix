const TABLE_NAME = 'complementary-certifications';
const key = 'PRO_SANTE';

const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('key').unique().notNullable().alter();
  });

  await knex(TABLE_NAME)
    .insert({
      label: 'Pix+ Professionnels de santé',
      key: 'PRO_SANTE',
      hasComplementaryReferential: true,
      hasExternalJury: false,
      certificationExtraTime: 45,
      minimumReproducibilityRate: 75,
      minimumReproducibilityRateLowerLevel: 60,
    })
    .onConflict('key')
    .merge([
      'label',
      'hasComplementaryReferential',
      'hasExternalJury',
      'certificationExtraTime',
      'minimumReproducibilityRate',
      'minimumReproducibilityRateLowerLevel',
    ]);
};

const down = async function (knex) {
  await knex(TABLE_NAME).where({ key }).del();
};

export { down, up };
