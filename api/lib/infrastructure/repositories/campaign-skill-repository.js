import { knex } from '../../../db/knex-database-connection.js';

/**
 *
 * @param {number} campaignId
 *
 * @returns Promise<string[]>
 */
const getSkillIdsByCampaignId = async (campaignId) =>
  await knex('campaign_skills').where({ campaignId: campaignId }).pluck('skillId');

export { getSkillIdsByCampaignId };
