exports.up = async function (knex) {
  await knex.schema.table('complementary-certifications', (table) => {
    table.decimal('minimumReproducibilityRate', 5, 2).nullable();
    table.integer('minimumEarnedPix').nullable();
  });

  await knex('complementary-certifications')
    .update({
      minimumReproducibilityRate: 50.0,
      minimumEarnedPix: 70,
    })
    .where({ name: 'CléA Numérique' });
};

exports.down = async function (knex) {
  await knex.schema.table('complementary-certifications', (table) => {
    table.dropColumn('minimumReproducibilityRate');
    table.dropColumn('minimumEarnedPix');
  });
};
