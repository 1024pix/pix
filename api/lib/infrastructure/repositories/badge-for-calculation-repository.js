import _ from 'lodash';

import { SCOPES } from '../../../src/shared/domain/models/BadgeDetails.js';
import { BadgeCriterionForCalculation, BadgeForCalculation } from '../../../src/shared/domain/models/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import * as campaignRepository from './campaign-repository.js';

export { findByCampaignId, findByCampaignParticipationId, getByCertifiableBadgeAcquisition };

const findByCampaignParticipationId = async function ({ campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const badgesDTO = await knexConn('badges')
    .select('badges.id')
    .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where('campaign-participations.id', campaignParticipationId)
    .orderBy('badges.id');

  const badgeIds = badgesDTO.map(({ id }) => id);
  const badgeCriteriaDTO = await knexConn('badge-criteria')
    .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes'])
    .whereIn('badgeId', badgeIds)
    .orderBy('badge-criteria.id');
  const badgeCriteriaDTOByBadge = _.groupBy(badgeCriteriaDTO, 'badgeId');

  const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
    campaignParticipationId,
  });
  const campaignSkillIds = campaignSkills.map(({ id }) => id);
  const campaignSkillsByTube = _.groupBy(campaignSkills, 'tubeId');

  const badges = [];
  for (const badgeDTO of badgesDTO) {
    const badge = await _buildBadge(
      knexConn,
      campaignSkillsByTube,
      campaignSkillIds,
      badgeCriteriaDTOByBadge[badgeDTO.id],
      badgeDTO,
    );
    badges.push(badge);
  }
  return _.compact(badges);
};

const findByCampaignId = async function ({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  const badgesDTO = await knexConn('badges')
    .select('badges.id')
    .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .orderBy('badges.id');

  const badgeIds = badgesDTO.map(({ id }) => id);
  const badgeCriteriaDTO = await knexConn('badge-criteria')
    .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes'])
    .whereIn('badgeId', badgeIds)
    .orderBy('badge-criteria.id');
  const badgeCriteriaDTOByBadge = _.groupBy(badgeCriteriaDTO, 'badgeId');

  const campaignSkills = await campaignRepository.findSkills({
    campaignId,
  });
  const campaignSkillIds = campaignSkills.map(({ id }) => id);
  const campaignSkillsByTube = _.groupBy(campaignSkills, 'tubeId');

  const badges = [];
  for (const badgeDTO of badgesDTO) {
    const badge = await _buildBadge(
      knexConn,
      campaignSkillsByTube,
      campaignSkillIds,
      badgeCriteriaDTOByBadge[badgeDTO.id],
      badgeDTO,
    );
    badges.push(badge);
  }
  return _.compact(badges);
};

const getByCertifiableBadgeAcquisition = async function ({ certifiableBadgeAcquisition }) {
  const knexConn = DomainTransaction.getConnection();
  const badgeId = certifiableBadgeAcquisition.badgeId;
  const campaignId = certifiableBadgeAcquisition.campaignId;

  const badgeDTO = await knexConn('badges')
    .select('badges.id')
    .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .where('badges.id', badgeId)
    .first();
  if (!badgeDTO) return null;

  const badgeCriteriaDTO = await knexConn('badge-criteria')
    .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes'])
    .where('badgeId', badgeDTO.id)
    .orderBy('badge-criteria.id');

  const campaignSkills = await campaignRepository.findSkills({
    campaignId,
  });
  const campaignSkillIds = campaignSkills.map(({ id }) => id);
  const campaignSkillsByTube = _.groupBy(campaignSkills, 'tubeId');

  return _buildBadge(knexConn, campaignSkillsByTube, campaignSkillIds, badgeCriteriaDTO, badgeDTO);
};

async function _buildBadge(knex, campaignSkillsByTube, campaignSkillIds, badgeCriteriaDTO, badgeDTO) {
  const badgeCriteria = [];
  for (const badgeCriterionDTO of badgeCriteriaDTO) {
    if (badgeCriterionDTO.scope === SCOPES.CAMPAIGN_PARTICIPATION) {
      badgeCriteria.push(
        new BadgeCriterionForCalculation({
          threshold: badgeCriterionDTO.threshold,
          skillIds: campaignSkillIds,
        }),
      );
    }
    if (badgeCriterionDTO.scope === SCOPES.CAPPED_TUBES) {
      let skillIds = [];
      for (const cappedTubeDTO of badgeCriterionDTO.cappedTubes) {
        const skillsForTube = campaignSkillsByTube[cappedTubeDTO.id] || [];
        const skillsUnderOrEqualLevel = skillsForTube
          .filter((skill) => skill.difficulty <= cappedTubeDTO.level)
          .map(({ id }) => id);
        skillIds = [...skillIds, ...skillsUnderOrEqualLevel];
      }
      if (skillIds.length > 0) {
        badgeCriteria.push(
          new BadgeCriterionForCalculation({
            threshold: badgeCriterionDTO.threshold,
            skillIds,
          }),
        );
      }
    }
  }
  return badgeCriteria.length > 0
    ? new BadgeForCalculation({
        id: badgeDTO.id,
        badgeCriteria,
      })
    : null;
}
