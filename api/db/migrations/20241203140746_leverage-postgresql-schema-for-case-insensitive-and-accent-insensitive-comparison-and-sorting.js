const TABLE_NAME = 'users';
const COLUMN_EMAIL2_NAME = 'email2';
const COLUMN_FIRSTNAME2_NAME = 'firstName2';
const COLUMN_LASTNAME2_NAME = 'lastName2';
const COLUMN_EMAIL3_NAME = 'email3';
const COLUMN_FIRSTNAME3_NAME = 'firstName3';
const COLUMN_LASTNAME3_NAME = 'lastName3';

const up = async function (knex) {
  // CITEXT
  await knex.schema.raw('create extension if not exists citext');

  await knex.schema.table(TABLE_NAME, function (table) {
    table.specificType(COLUMN_EMAIL2_NAME, 'citext').unique(); //.notNull();
    table.specificType(COLUMN_FIRSTNAME2_NAME, 'citext'); //.notNull();
    table.specificType(COLUMN_LASTNAME2_NAME, 'citext'); //.notNull();
  });

  // COLLATIONS
  await knex.schema.raw('drop collation if exists case_insensitive');
  await knex.schema.raw('drop collation if exists ignore_accents');

  await knex.schema.raw(
    "create collation case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false)",
  );
  await knex.schema.raw(
    "create collation case_accent_insensitive (provider = icu, locale = 'und-u-ks-level1', deterministic = false)",
  );

  // await knex.schema.table(TABLE_NAME, function (table) {
  // For now only works with MySQL: contrib to Knex the PostgreSQL support!
  // table.string(COLUMN_EMAIL3_NAME).unique().collate('case_insensitive');
  // table.string(COLUMN_FIRSTNAME3_NAME).collate('case_accent_insensitive');
  // table.string(COLUMN_LASTNAME3_NAME).collate('case_accent_insensitive');
  // });

  // eslint-disable-next-line knex/avoid-injections
  await knex.schema.raw(
    `alter table "users" add column "${COLUMN_EMAIL3_NAME}" character varying(255) collate "case_insensitive"`,
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.schema.raw(
    `alter table "users" add column "${COLUMN_FIRSTNAME3_NAME}" character varying(255) collate "case_accent_insensitive"`,
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.schema.raw(
    `alter table "users" add column "${COLUMN_LASTNAME3_NAME}" character varying(255) collate "case_accent_insensitive"`,
  );
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_EMAIL2_NAME);
    table.dropColumn(COLUMN_FIRSTNAME2_NAME);
    table.dropColumn(COLUMN_LASTNAME2_NAME);
  });

  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_EMAIL3_NAME);
    table.dropColumn(COLUMN_FIRSTNAME3_NAME);
    table.dropColumn(COLUMN_LASTNAME3_NAME);
  });
};

export { down, up };
