const up = function(knex) {
  return knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "schoolingRegistrationId" SET NOT NULL');
};

const down = function(knex) {
  return knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "schoolingRegistrationId" DROP NOT NULL');
};

export { up, down };
