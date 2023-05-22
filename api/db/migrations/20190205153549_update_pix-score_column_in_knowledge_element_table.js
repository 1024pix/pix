const TABLE_NAME = 'knowledge-elements';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (t) => {
    t.float('earnedPix').notNullable().defaultTo(0);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('earnedPix');
  });
};

export { up, down };
