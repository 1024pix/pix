const up = async function (knex) {
  await knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "userId" SET NOT NULL');
  await knex.raw(
    'ALTER TABLE "account-recovery-demands" ADD CONSTRAINT "account_recovery_demands_userid_foreign" FOREIGN KEY ("userId") REFERENCES "users" (id)'
  );
};

const down = async function (knex) {
  await knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "userId" DROP NOT NULL');
  await knex.raw('ALTER TABLE "account-recovery-demands" DROP CONSTRAINT "account_recovery_demands_userid_foreign"');
};

export { up, down };
