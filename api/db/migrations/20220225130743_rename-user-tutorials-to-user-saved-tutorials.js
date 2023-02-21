/* eslint-disable knex/avoid-injections */
const OLD_TABLE_NAME = 'user_tutorials';
const NEW_TABLE_NAME = 'user-saved-tutorials';

export const up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
  await knex.raw(
    `ALTER TABLE "${NEW_TABLE_NAME}" RENAME CONSTRAINT "${OLD_TABLE_NAME}_pkey" TO "${NEW_TABLE_NAME}_pkey"`
  );
  await knex.raw(
    `ALTER TABLE "${NEW_TABLE_NAME}" RENAME CONSTRAINT "${OLD_TABLE_NAME}_userid_tutorialid_unique" TO "${NEW_TABLE_NAME}_userid_tutorialid_unique"`
  );
};

export const down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
  await knex.raw(
    `ALTER TABLE "${OLD_TABLE_NAME}" RENAME CONSTRAINT "${NEW_TABLE_NAME}_pkey" TO "${OLD_TABLE_NAME}_pkey"`
  );
  await knex.raw(
    `ALTER TABLE "${OLD_TABLE_NAME}" RENAME CONSTRAINT "${NEW_TABLE_NAME}_userid_tutorialid_unique" TO "${OLD_TABLE_NAME}_userid_tutorialid_unique"`
  );
};
/* eslint-enable knex/avoid-injections */
