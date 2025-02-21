const up = async function (knex) {
  await knex.schema.raw('drop collation if exists parcoursup_case_accent_punctuation_insensitive');
  await knex.schema.raw(
    "create collation parcoursup_case_accent_punctuation_insensitive (provider = icu, locale = 'und-u-ka-shifted-ks-level1-kv-punct', deterministic = false);",
  );

  await knex.schema.raw(
    'ALTER TABLE data_export_parcoursup_certif_result alter column first_name type varchar(255) COLLATE parcoursup_case_accent_punctuation_insensitive;',
  );
  await knex.schema.raw(
    'ALTER TABLE data_export_parcoursup_certif_result alter column last_name type varchar(255) COLLATE parcoursup_case_accent_punctuation_insensitive;',
  );
};

const down = async function (knex) {
  await knex.schema.raw('ALTER TABLE data_export_parcoursup_certif_result alter column last_name type varchar(255);');
  await knex.schema.raw('ALTER TABLE data_export_parcoursup_certif_result alter column first_name type varchar(255);');
  await knex.schema.raw('drop collation if exists parcoursup_case_accent_punctuation_insensitive');
};

export { down, up };
