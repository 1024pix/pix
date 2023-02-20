const TABLE_NAME = 'knowledge-elements';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (t) => {
    t.float('earnedPix').notNullable().defaultTo(0);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('earnedPix');
  });
};
