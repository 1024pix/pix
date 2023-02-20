const CAMPAIGN_PARTICIPATIONS_TABLE = 'campaign-participations';
const ISIMPROVED_COLUMN = 'isImproved';
const DELETEDAT_COLUMN = 'deletedAt';
const DELETEDBY_COLUMN = 'deletedBy';
const ORGANIZATIONLEARNERID_COLUMN = 'organizationLearnerId';
const CAMPAIGNID_COLUMN = 'campaignId';
const NEW_CONSTRAINT_NAME = 'one_active_participation_by_learner';

export const up = async (knex) => {
  await knex.schema.alterTable(CAMPAIGN_PARTICIPATIONS_TABLE, function (table) {
    table.integer(ORGANIZATIONLEARNERID_COLUMN).notNullable().alter();
  });

  return knex.raw(
    `CREATE UNIQUE INDEX :name: ON :participationsTable: (:campaignId:, :organizationLearnerId: ) WHERE :isImproved: IS FALSE AND :deletedAt: IS NULL AND :deletedBy: IS NULL;`,
    {
      name: NEW_CONSTRAINT_NAME,
      participationsTable: CAMPAIGN_PARTICIPATIONS_TABLE,
      campaignId: CAMPAIGNID_COLUMN,
      organizationLearnerId: ORGANIZATIONLEARNERID_COLUMN,
      isImproved: ISIMPROVED_COLUMN,
      deletedAt: DELETEDAT_COLUMN,
      deletedBy: DELETEDBY_COLUMN,
    }
  );
};

export const down = async (knex) => {
  await knex.schema.alterTable(CAMPAIGN_PARTICIPATIONS_TABLE, function (table) {
    table.integer(ORGANIZATIONLEARNERID_COLUMN).nullable().alter();
  });

  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`DROP INDEX ${NEW_CONSTRAINT_NAME};`);
};
