const logger = require('../../lib/infrastructure/logger');

const MAX_ROW_COUNT_FOR_VALIDATING_FK_IN_DEPLOYMENT = 500000;
const MAX_ROW_COUNT_FOR_CREATING_BACK_PK_IN_DEPLOYMENT = 500000;

exports.up = async function(knex) {

  await knex.raw('LOCK TABLE "answers" IN ACCESS EXCLUSIVE MODE');
  await knex.raw('LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE');

  await knex.raw('ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_answerid_foreign"');

  await knex.raw('DROP TRIGGER "trg_answers" ON "answers"');
  await knex.raw('DROP FUNCTION "copy_int_id_to_bigintId_on_answers"');
  await knex.raw('ALTER SEQUENCE "answers_id_seq" OWNED BY "answers"."bigintId"');
  await knex.raw('ALTER SEQUENCE "answers_id_seq" AS BIGINT');
  await knex.raw('ALTER TABLE "answers" ALTER COLUMN "bigintId" SET DEFAULT nextval(\'"answers_id_seq"\')');
  await knex.raw('ALTER TABLE "answers" ALTER COLUMN "id" DROP DEFAULT');
  await knex.raw('ALTER TABLE "answers" DROP CONSTRAINT "answers_pkey"');
  await knex.raw('ALTER TABLE "answers" ALTER COLUMN "id" DROP NOT NULL');
  await knex.raw('ALTER TABLE "answers" ADD CONSTRAINT "answers_pkey" PRIMARY KEY USING INDEX "answers_bigintId_index"');
  await knex.raw('ALTER TABLE "answers" RENAME COLUMN "id" TO "intId"');
  await knex.raw('ALTER TABLE "answers" RENAME COLUMN "bigintId" TO "id"');

  await knex.raw('DROP TRIGGER "trg_knowledge_elements_answer_bigintId" ON "knowledge-elements"');
  await knex.raw('DROP FUNCTION "copy_answer_id_to_answer_bigintId_on_knowledge_elements"');
  await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "answerId" TO "answer_intId"');
  await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "answer_bigintId" TO "answerId"');

  const data = await knex.raw('SELECT MAX("id") FROM "knowledge-elements"');
  const rowCount = data.rows[0].max;
  if (rowCount <= MAX_ROW_COUNT_FOR_VALIDATING_FK_IN_DEPLOYMENT) {
    await knex.raw('ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_answerid_foreign" FOREIGN KEY ("answerId") REFERENCES "answers" ("id")');
  } else {
    await knex.raw('ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_answerid_foreign" FOREIGN KEY ("answerId") REFERENCES "answers" ("id") NOT VALID');
    logger.info(`Row count exceeds ${MAX_ROW_COUNT_FOR_VALIDATING_FK_IN_DEPLOYMENT} to validate FK, run script/validate-referencing-ke-foreign-keys-to-answers after deployment`);
  }

};

exports.down = async function(knex) {
  const data = await knex.raw('SELECT MAX("id") FROM "answers"');
  const rowCount = data.rows[0].max;

  if (rowCount < MAX_ROW_COUNT_FOR_CREATING_BACK_PK_IN_DEPLOYMENT) {

    await knex.raw('LOCK TABLE "answers" IN ACCESS EXCLUSIVE MODE');
    await knex.raw('LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE');

    await knex.raw('ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_answerid_foreign"');

    await knex.raw('ALTER SEQUENCE "answers_id_seq" OWNED BY "answers"."intId"');
    await knex.raw('ALTER SEQUENCE "answers_id_seq" AS INTEGER');
    await knex.raw('ALTER TABLE "answers" ALTER COLUMN "intId" SET DEFAULT nextval(\'"answers_id_seq"\')');
    await knex.raw('ALTER TABLE "answers" ALTER COLUMN "id" DROP DEFAULT');
    await knex.raw('ALTER TABLE "answers" DROP CONSTRAINT "answers_pkey"');
    await knex.raw('ALTER TABLE "answers" ALTER COLUMN "id" DROP NOT NULL');
    // intIds are NULL on tuples inserted after up migration, as we did not create triggers
    await knex.raw('UPDATE "answers" SET "intId" = "id" WHERE "intId" IS NULL');
    await knex.raw('ALTER TABLE "answers" RENAME COLUMN "id" TO "bigintId"');
    await knex.raw('ALTER TABLE "answers" RENAME COLUMN "intId" TO "id"');
    await knex.raw('ALTER TABLE "answers" ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("id")');

    // UNIQUE and NOT NULL constraints cannot be extracted from primary key, so we have to create them afresh
    await knex.raw('CREATE UNIQUE INDEX "answers_bigintId_index" ON "answers"("bigintId")');
    await knex.raw('ALTER TABLE "answers" ALTER COLUMN "bigintId" SET NOT NULL');

    await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "answerId" TO "answer_bigintId"');
    await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "answer_intId" TO "answerId"');
    await knex.raw('ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_answerid_foreign" FOREIGN KEY ("answerId") REFERENCES "answers" ("id")');

    await knex.raw(`CREATE OR REPLACE FUNCTION "copy_int_id_to_bigintId_on_answers"()
                    RETURNS TRIGGER AS
                    $$
                    BEGIN
                      NEW."bigintId" = NEW.id::BIGINT;
                      RETURN NEW;
                    END
                    $$ LANGUAGE plpgsql;`);

    await knex.raw(`CREATE TRIGGER "trg_answers"
                    BEFORE INSERT ON "answers"
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

  } else {
    // There is no going back here, as revert will be too time-consuming to be performed during deployment
    // https://doc.scalingo.com/platform/app/postdeploy-hook#limits
  }

};
