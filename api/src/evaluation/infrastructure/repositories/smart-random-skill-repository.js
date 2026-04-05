import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { SmartRandomSkill } from '../../domain/models/SmartRandomSkill.js';

/**
 *
 * @param {string} competenceId
 * @returns {Promise<SmartRandomSkill[]>}
 */
export async function findActiveByCompetenceId(competenceId) {
  const lcmsSkills = await skillRepository.findActiveByCompetenceId_proxy(competenceId);
  return lcmsSkills.map(
    (lcmsSkill) =>
      new SmartRandomSkill({
        id: lcmsSkill.id,
        name: lcmsSkill.name,
        difficulty: lcmsSkill.level,
      }),
  );
}

/**
 *
 * @param {number} campaignParticipationId
 * @returns {Promise<SmartRandomSkill[]>}
 */
export async function findOperativeByCampaignParticipationId(campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();
  const skillIds = await knexConn
    .pluck('campaign_skills.skillId')
    .from('campaign-participations')
    .join('campaign_skills', 'campaign_skills.campaignId', 'campaign-participations.campaignId')
    .where('campaign-participations.id', campaignParticipationId);
  if (skillIds.length === 0) {
    return [];
  }
  const lcmsSkills = await skillRepository.findOperativeByIds_proxy(skillIds);
  return lcmsSkills.map(
    (lcmsSkill) =>
      new SmartRandomSkill({
        id: lcmsSkill.id,
        name: lcmsSkill.name,
        difficulty: lcmsSkill.level,
      }),
  );
}
