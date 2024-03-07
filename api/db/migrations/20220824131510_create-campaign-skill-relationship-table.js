const CAMPAIGN_TABLE_NAME = 'campaigns';
const CAMPAIGN_SKILL_TABLE_NAME = 'campaign_skills';
const CAMPAIGN_ID_COLUMN = 'campaignId';
const SKILL_ID_COLUMN = 'skillId';

const up = async function (knex) {
  await knex.schema.createTable(CAMPAIGN_SKILL_TABLE_NAME, (t) => {
    t.integer(CAMPAIGN_ID_COLUMN).notNullable().references(`${CAMPAIGN_TABLE_NAME}.id`);
    t.string(SKILL_ID_COLUMN).notNullable();
    t.primary([CAMPAIGN_ID_COLUMN, SKILL_ID_COLUMN]);
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(CAMPAIGN_SKILL_TABLE_NAME);
};

export { down, up };
