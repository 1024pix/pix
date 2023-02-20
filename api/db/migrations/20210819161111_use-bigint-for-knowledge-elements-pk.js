const MAX_ROW_COUNT_FOR_CREATING_BACK_PK_IN_DEPLOYMENT = 500000;

export const up = async function (knex) {
  await knex.raw('LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE');
  await knex.raw('DROP TRIGGER "trg_knowledge-elements" ON "knowledge-elements"');
  await knex.raw('DROP FUNCTION copy_int_id_to_bigint_id');
  await knex.raw('ALTER SEQUENCE "knowledge-elements_id_seq" OWNED BY "knowledge-elements"."bigintId"');
  await knex.raw('ALTER SEQUENCE "knowledge-elements_id_seq" AS BIGINT');
  await knex.raw(
    'ALTER TABLE "knowledge-elements" ALTER COLUMN "bigintId" SET DEFAULT nextval(\'"knowledge-elements_id_seq"\')'
  );
  await knex.raw('ALTER TABLE "knowledge-elements" ALTER COLUMN "id" DROP DEFAULT');
  await knex.raw('ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge-elements_pkey"');
  await knex.raw('ALTER TABLE "knowledge-elements" ALTER COLUMN "id" DROP NOT NULL');
  await knex.raw(
    'ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge-elements_pkey" PRIMARY KEY USING INDEX "knowledge-elements_bigintId_index"'
  );
  await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "id" TO "intId"');
  await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "bigintId" TO "id"');
};

export const down = async function (knex) {
  const nbRows = (await knex('knowledge-elements').max('id').first()).max;

  if (nbRows < MAX_ROW_COUNT_FOR_CREATING_BACK_PK_IN_DEPLOYMENT) {
    await knex.raw('LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE');

    await knex.raw('ALTER SEQUENCE "knowledge-elements_id_seq" OWNED BY "knowledge-elements"."intId"');
    await knex.raw('ALTER SEQUENCE "knowledge-elements_id_seq" AS INTEGER');
    await knex.raw(
      'ALTER TABLE "knowledge-elements" ALTER COLUMN "intId" SET DEFAULT nextval(\'"knowledge-elements_id_seq"\')'
    );
    await knex.raw('ALTER TABLE "knowledge-elements" ALTER COLUMN "id" DROP DEFAULT');
    await knex.raw('ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge-elements_pkey"');
    await knex.raw('UPDATE "knowledge-elements" SET "intId" = "id" WHERE "intId" IS NULL');
    await knex.raw('ALTER TABLE "knowledge-elements" ALTER COLUMN "intId" SET NOT NULL');
    await knex.raw('ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge-elements_pkey" PRIMARY KEY("intId")');
    await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "id" TO "bigintId"');
    await knex.raw('ALTER TABLE "knowledge-elements" RENAME COLUMN "intId" TO "id"');

    // UNIQUE and NOT NULL constraints cannot be extracted from primary key, so we have to create them afresh
    await knex.raw('CREATE UNIQUE INDEX "knowledge-elements_bigintId_index" ON "knowledge-elements"("bigintId")');
    await knex.raw('ALTER TABLE "knowledge-elements" ALTER COLUMN "bigintId" SET NOT NULL');

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
  } else {
    // There is no going back here, as revert will be too time-consuming to be performed during deployment
    // https://doc.scalingo.com/platform/app/postdeploy-hook#limits
  }
};
