const CERTIFICATION_CANDIDATES = 'certification-candidates';
const ACCOUNT_RECOVERY_DEMANDS = 'account-recovery-demands';
const CAMPAIGN_PARTICIPATIONS = 'campaign-participations';
const OLD_COLUMN_NAME = 'schoolingRegistrationId';
const NEW_COLUMN_NAME = 'organizationLearnerId';

export const up = async function (knex) {
  await knex.schema.table(ACCOUNT_RECOVERY_DEMANDS, (table) => table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));

  await knex.schema.table(CERTIFICATION_CANDIDATES, (table) => {
    table.dropIndex(OLD_COLUMN_NAME);
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
    table.index(NEW_COLUMN_NAME);
  });

  return knex.schema.table(CAMPAIGN_PARTICIPATIONS, (table) => {
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
    table.index(NEW_COLUMN_NAME);
  });
};

export const down = async function (knex) {
  await knex.schema.table(ACCOUNT_RECOVERY_DEMANDS, (table) => table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));

  await knex.schema.table(CERTIFICATION_CANDIDATES, (table) => {
    table.dropIndex(NEW_COLUMN_NAME);
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
    table.index(OLD_COLUMN_NAME);
  });

  return knex.schema.table(CAMPAIGN_PARTICIPATIONS, (table) => {
    table.dropIndex(NEW_COLUMN_NAME);
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  });
};
