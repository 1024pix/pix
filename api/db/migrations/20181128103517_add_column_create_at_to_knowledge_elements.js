const TABLE_NAME = 'knowledge-elements';
const moment = require('moment');

exports.up = (knex ) => {

  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

  return knex.schema.table(TABLE_NAME, (table) => table.dateTime('createdAt').notNullable().defaultTo(currentTime))
    .then(() => knex.raw('update "knowledge-elements" set "createdAt" = (select "createdAt" from answers where "knowledge-elements"."answerId" = answers.id);'));
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('createdAt');
  });
};
