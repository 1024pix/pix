const OLD_TABLE_NAME = 'user_tutorials';
const NEW_TABLE_NAME = 'user-saved-tutorials';

const up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${NEW_TABLE_NAME}" RENAME CONSTRAINT "${OLD_TABLE_NAME}_pkey" TO "${NEW_TABLE_NAME}_pkey"`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${NEW_TABLE_NAME}" RENAME CONSTRAINT "${OLD_TABLE_NAME}_userid_tutorialid_unique" TO "${NEW_TABLE_NAME}_userid_tutorialid_unique"`
  );
};

const down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${OLD_TABLE_NAME}" RENAME CONSTRAINT "${NEW_TABLE_NAME}_pkey" TO "${OLD_TABLE_NAME}_pkey"`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${OLD_TABLE_NAME}" RENAME CONSTRAINT "${NEW_TABLE_NAME}_userid_tutorialid_unique" TO "${OLD_TABLE_NAME}_userid_tutorialid_unique"`
  );
};

export { up, down };
