const TABLE_NAME = 'competence-marks';

exports.up = (knex) => {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.integer('level');
      t.integer('score').unsigned();
      t.text('area_code').notNull();
      t.text('competence_code').notNull();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
      t.integer('correctionId').unsigned().references('corrections.id');
    })
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
