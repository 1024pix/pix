const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const { BadgeForCalculation, BadgeCriterion } = require('../../domain/models/BadgeForCalculation');
const { SCOPES } = require('../../domain/models/BadgeCriterion');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const campaignRepository = require('./campaign-repository');

module.exports = {
  async findByCampaignParticipationId({
    campaignParticipationId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const badgesDTO = await knexConn('badges')
      .select('badges.id')
      .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaign-participations.id', campaignParticipationId)
      .orderBy('badges.id');

    const badgeIds = badgesDTO.map(({ id }) => id);
    const badgeCriteriaDTO = await knexConn('badge-criteria')
      .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes', 'skillSetIds'])
      .whereIn('badgeId', badgeIds)
      .orderBy('badge-criteria.id');
    const badgeCriteriaDTOByBadge = _.groupBy(badgeCriteriaDTO, 'badgeId');

    const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
      campaignParticipationId,
      domainTransaction,
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
        badgeDTO
      );
      badges.push(badge);
    }
    return _.compact(badges);
  },

  async findByCampaignId({ campaignId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const badgesDTO = await knexConn('badges')
      .select('badges.id')
      .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
      .where('campaigns.id', campaignId)
      .orderBy('badges.id');

    const badgeIds = badgesDTO.map(({ id }) => id);
    const badgeCriteriaDTO = await knexConn('badge-criteria')
      .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes', 'skillSetIds'])
      .whereIn('badgeId', badgeIds)
      .orderBy('badge-criteria.id');
    const badgeCriteriaDTOByBadge = _.groupBy(badgeCriteriaDTO, 'badgeId');

    const campaignSkills = await campaignRepository.findSkills({
      campaignId,
      domainTransaction,
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
        badgeDTO
      );
      badges.push(badge);
    }
    return _.compact(badges);
  },

  async getByCertifiableBadgeAcquisition({
    certifiableBadgeAcquisition,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const badgeId = certifiableBadgeAcquisition.badgeId;
    const campaignId = certifiableBadgeAcquisition.campaignId;
    const knexConn = domainTransaction?.knexTransaction || knex;
    const badgeDTO = await knexConn('badges')
      .select('badges.id')
      .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
      .where('campaigns.id', campaignId)
      .where('badges.id', badgeId)
      .first();
    if (!badgeDTO) return null;

    const badgeCriteriaDTO = await knexConn('badge-criteria')
      .select(['id', 'threshold', 'badgeId', 'scope', 'cappedTubes', 'skillSetIds'])
      .where('badgeId', badgeDTO.id)
      .orderBy('badge-criteria.id');

    const campaignSkills = await campaignRepository.findSkills({
      campaignId,
      domainTransaction,
    });
    const campaignSkillIds = campaignSkills.map(({ id }) => id);
    const campaignSkillsByTube = _.groupBy(campaignSkills, 'tubeId');

    return _buildBadge(knexConn, campaignSkillsByTube, campaignSkillIds, badgeCriteriaDTO, badgeDTO);
  },
};

async function _buildBadge(knex, campaignSkillsByTube, campaignSkillIds, badgeCriteriaDTO, badgeDTO) {
  const badgeCriteria = [];
  for (const badgeCriterionDTO of badgeCriteriaDTO) {
    if (badgeCriterionDTO.scope === SCOPES.CAMPAIGN_PARTICIPATION) {
      badgeCriteria.push(
        new BadgeCriterion({
          threshold: badgeCriterionDTO.threshold,
          skillIds: campaignSkillIds,
        })
      );
    }
    if (badgeCriterionDTO.scope === SCOPES.SKILL_SET) {
      const arrayOfSkillIds = await knex('skill-sets').pluck('skillIds').whereIn('id', badgeCriterionDTO.skillSetIds);
      for (const skillIds of arrayOfSkillIds) {
        badgeCriteria.push(
          new BadgeCriterion({
            threshold: badgeCriterionDTO.threshold,
            skillIds,
          })
        );
      }
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
          new BadgeCriterion({
            threshold: badgeCriterionDTO.threshold,
            skillIds,
          })
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
