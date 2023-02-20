export const up = function (knex) {
  return knex.raw(
    'ALTER TABLE "account-recovery-demands" ADD CONSTRAINT account_recovery_demands_temporary_key_unique UNIQUE("temporaryKey")'
  );
};

export const down = function (knex) {
  return knex.raw(
    'ALTER TABLE "account-recovery-demands" DROP CONSTRAINT account_recovery_demands_temporary_key_unique'
  );
};
