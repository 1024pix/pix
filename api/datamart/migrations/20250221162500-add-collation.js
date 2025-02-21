const SCHEMA_NAME =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATAMART_DATABASE_SCHEMA
    : process.env.DATAMART_DATABASE_SCHEMA || 'public';

const up = async function (knex) {
  await knex.schema.raw('drop collation if exists :schema:."parcoursup_case_accent_punctuation_insensitive"', {
    schema: SCHEMA_NAME,
  });
  await knex.schema.raw(
    'create collation :schema:."parcoursup_case_accent_punctuation_insensitive" (provider = icu, locale = "und-u-ka-shifted-ks-level1-kv-punct", deterministic = false);',
    {
      schema: SCHEMA_NAME,
    },
  );

  await knex.schema.raw(
    'ALTER TABLE :schema:."data_export_parcoursup_certif_result" alter column first_name type varchar(255) COLLATE :schema:.parcoursup_case_accent_punctuation_insensitive;',
    {
      schema: SCHEMA_NAME,
    },
  );
  await knex.schema.raw(
    'ALTER TABLE :schema:.data_export_parcoursup_certif_result alter column last_name type varchar(255) COLLATE :schema:.parcoursup_case_accent_punctuation_insensitive;',
    {
      schema: SCHEMA_NAME,
    },
  );
};

const down = async function (knex) {
  await knex.schema.raw(
    'ALTER TABLE :schema:.data_export_parcoursup_certif_result alter column last_name type varchar(255);',
    {
      schema: SCHEMA_NAME,
    },
  );
  await knex.schema.raw(
    'ALTER TABLE :schema:.data_export_parcoursup_certif_result alter column first_name type varchar(255);',
    {
      schema: SCHEMA_NAME,
    },
  );
  await knex.schema.raw('drop collation if exists :schema:."parcoursup_case_accent_punctuation_insensitive"', {
    schema: SCHEMA_NAME,
  });
};

export { down, up };
