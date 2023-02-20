const TABLE_NAME = 'knowledge-elements';
const COLUMN_NAME = 'bigintId';
const FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK = -1;

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .bigInteger(COLUMN_NAME)
      .notNullable()
      .defaultTo(FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK);
  });

  await knex.raw(`CREATE OR REPLACE FUNCTION copy_int_id_to_bigint_id()
  RETURNS TRIGGER AS
  $$
  BEGIN
    NEW."bigintId" = NEW.id::BIGINT;
    RETURN NEW;
  END
  $$ LANGUAGE plpgsql;`);

  await knex.raw(`CREATE TRIGGER "trg_knowledge-elements"
  BEFORE INSERT ON "knowledge-elements"
  FOR EACH ROW
  EXECUTE FUNCTION copy_int_id_to_bigint_id();`);
};

export const down = async function (knex) {
  await knex.raw('DROP TRIGGER "trg_knowledge-elements" ON "knowledge-elements"');
  await knex.raw('DROP FUNCTION copy_int_id_to_bigint_id');

  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
