const TABLE_NAME = 'answers';
const COLUMN_NAME = 'bigintId';
const FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK = -1;

exports.up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.bigInteger(COLUMN_NAME).notNullable().defaultTo(FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK);
  });

  await knex.schema.table('knowledge-elements', function(table) {
    table.bigInteger('answer_bigintId').notNullable().defaultTo(FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK);
  });
  await knex.raw(`CREATE OR REPLACE FUNCTION "copy_int_id_to_bigintId_on_answers"()
  RETURNS TRIGGER AS
  $$
  BEGIN
    NEW."bigintId" = NEW.id::BIGINT;
    RETURN NEW;
  END
  $$ LANGUAGE plpgsql;`);

  await knex.raw(`CREATE TRIGGER "trg_${TABLE_NAME}"
  BEFORE INSERT ON "${TABLE_NAME}"
  FOR EACH ROW
  EXECUTE FUNCTION "copy_int_id_to_bigintId_on_answers"();`);

  await knex.raw(`CREATE OR REPLACE FUNCTION "copy_answer_id_to_answer_bigintId_on_knowledge_elements"()
  RETURNS TRIGGER AS
  $$
  BEGIN
    NEW."answer_bigintId" = NEW."answerId"::BIGINT;
    RETURN NEW;
  END
  $$ LANGUAGE plpgsql;`);

  await knex.raw(`CREATE TRIGGER "trg_knowledge_elements_answer_bigintId"
  BEFORE INSERT ON "knowledge-elements"
  FOR EACH ROW
  EXECUTE FUNCTION "copy_answer_id_to_answer_bigintId_on_knowledge_elements"();`);
};

exports.down = async function(knex) {

  await knex.raw('DROP TRIGGER "trg_answers" ON "answers"');
  await knex.raw('DROP TRIGGER "trg_knowledge_elements_answer_bigintId" ON "knowledge-elements"');
  await knex.raw('DROP FUNCTION "copy_int_id_to_bigintId_on_answers"');
  await knex.raw('DROP FUNCTION "copy_answer_id_to_answer_bigintId_on_knowledge_elements"');

  await knex.raw('ALTER TABLE "answers" DROP COLUMN "bigintId"');
  await knex.raw('ALTER TABLE "knowledge-elements" DROP COLUMN "answer_bigintId"');

};
