const TABLE_NAME = 'knowledge-elements';
const moment = require('moment');
exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    // Alter table do not authorize variable default. Add date of now for old knowledgeElements
    table.dateTime('createdAt').defaultTo(moment());
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('createdAt');
  });
};
