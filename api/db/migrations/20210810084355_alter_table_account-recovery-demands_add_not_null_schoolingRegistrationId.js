exports.up = function (knex) {
  return knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "schoolingRegistrationId" SET NOT NULL');
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE "account-recovery-demands" ALTER COLUMN "schoolingRegistrationId" DROP NOT NULL');
};
