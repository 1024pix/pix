const OLD_TABLE_NAME = 'students';
const NEW_TABLE_NAME = 'schooling-registrations';

export const up = (knex) => {
  return knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
};

export const down = (knex) => {
  return knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
};
