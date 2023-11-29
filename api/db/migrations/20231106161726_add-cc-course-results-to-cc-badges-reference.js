const TABLE_NAME = 'complementary-certification-course-results';
const REF_TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'complementaryCertificationBadgeId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(COLUMN_NAME)
      .defaultTo(null)
      .references(`${REF_TABLE_NAME}.id`)
      .withKeyName('cccresults-ccbadgeId_foreignkey');
  });

  await knex(TABLE_NAME).update({
    [COLUMN_NAME]: knex(`${REF_TABLE_NAME}`)
      .select(`${REF_TABLE_NAME}.id`)
      .innerJoin('badges', 'badges.id', `${REF_TABLE_NAME}.badgeId`)
      // eslint-disable-next-line knex/avoid-injections
      .where('badges.key', '=', knex.raw(`"${TABLE_NAME}"."partnerKey"`)),
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
