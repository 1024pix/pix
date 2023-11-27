import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import * as skillRepository from '../../../../../lib/infrastructure/repositories/skill-repository.js';
import { Campaign } from '../../domain/read-models/Campaign.js';

const save = async function (campaigns, dependencies = { skillRepository }) {
  const trx = await knex.transaction();
  const campaignsToCreate = _.isArray(campaigns) ? campaigns : [campaigns];

  try {
    let latestCreatedCampaign;
    for (const campaign of campaignsToCreate) {
      const campaignAttributes = _.pick(campaign, [
        'name',
        'code',
        'title',
        'type',
        'idPixLabel',
        'customLandingPageText',
        'creatorId',
        'ownerId',
        'organizationId',
        'targetProfileId',
        'multipleSendings',
        'createdAt',
        'customResultPageText',
        'customResultPageButtonText',
        'customResultPageButtonUrl',
      ]);
      const [createdCampaignDTO] = await trx('campaigns').insert(campaignAttributes).returning('*');
      latestCreatedCampaign = new Campaign(createdCampaignDTO);
      if (latestCreatedCampaign.isAssessment()) {
        const cappedTubes = await trx('target-profile_tubes')
          .select('tubeId', 'level')
          .where('targetProfileId', campaignAttributes.targetProfileId);
        const skillData = [];
        for (const cappedTube of cappedTubes) {
          const allLevelSkills = await dependencies.skillRepository.findActiveByTubeId(cappedTube.tubeId);
          const rightLevelSkills = allLevelSkills.filter((skill) => skill.difficulty <= cappedTube.level);
          skillData.push(
            ...rightLevelSkills.map((skill) => ({ skillId: skill.id, campaignId: latestCreatedCampaign.id })),
          );
        }
        await trx.batchInsert('campaign_skills', skillData);
      }
    }
    await trx.commit();
    return latestCreatedCampaign;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const isCodeAvailable = async function (code) {
  return !(await knex('campaigns').first('id').where({ code }));
};

export { save, isCodeAvailable };
