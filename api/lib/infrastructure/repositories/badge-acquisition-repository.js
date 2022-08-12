const bluebird = require('bluebird');
const BadgeAcquisition = require('../../domain/models/BadgeAcquisition');
const Badge = require('../../domain/models/Badge');
const BadgeCriterion = require('../../domain/models/BadgeCriterion');
const SkillSet = require('../../domain/models/SkillSet');
const ComplementaryCertificationBadge = require('../../domain/models/ComplementaryCertificationBadge');
const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

module.exports = {
  async createOrUpdate({ badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    return bluebird.mapSeries(badgeAcquisitionsToCreate, async ({ badgeId, userId, campaignParticipationId }) => {
      const alreadyCreatedBadgeAcquisition = await knexConn(BADGE_ACQUISITIONS_TABLE)
        .select('id')
        .where({ badgeId, userId, campaignParticipationId });
      if (alreadyCreatedBadgeAcquisition.length === 0) {
        return knexConn(BADGE_ACQUISITIONS_TABLE).insert(badgeAcquisitionsToCreate);
      } else {
        return knexConn(BADGE_ACQUISITIONS_TABLE)
          .update({ updatedAt: knex.raw('CURRENT_TIMESTAMP') })
          .where({ userId, badgeId, campaignParticipationId });
      }
    });
  },

  async getAcquiredBadgeIds({ badgeIds, userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    return knexConn(BADGE_ACQUISITIONS_TABLE).pluck('badgeId').where({ userId }).whereIn('badgeId', badgeIds);
  },

  async getAcquiredBadgesByCampaignParticipations({
    campaignParticipationsIds,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const badges = await knexConn('badges')
      .distinct('badges.id')
      .select('badge-acquisitions.campaignParticipationId AS campaignParticipationId', 'badges.*')
      .from('badges')
      .join(BADGE_ACQUISITIONS_TABLE, 'badges.id', 'badge-acquisitions.badgeId')
      .where('badge-acquisitions.campaignParticipationId', 'IN', campaignParticipationsIds)
      .orderBy('badges.id');

    const acquiredBadgesByCampaignParticipations = {};
    for (const badge of badges) {
      if (acquiredBadgesByCampaignParticipations[badge.campaignParticipationId]) {
        acquiredBadgesByCampaignParticipations[badge.campaignParticipationId].push(badge);
      } else {
        acquiredBadgesByCampaignParticipations[badge.campaignParticipationId] = [badge];
      }
    }
    return acquiredBadgesByCampaignParticipations;
  },

  async findHighestCertifiable({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const certifiableBadgeAcquisitions = await knexConn(BADGE_ACQUISITIONS_TABLE)
      .select(
        'badges.*',
        'badge-acquisitions.*',
        'complementary-certification-badges.id as complementaryCertificationBadgeId',
        'complementary-certification-badges.level as complementaryCertificationBadgeLevel',
        'complementary-certification-badges.imageUrl as complementaryCertificationBadgeImageUrl',
        'complementary-certification-badges.label as complementaryCertificationBadgeLabel'
      )
      .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
      .join('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
      .where({
        'badge-acquisitions.userId': userId,
        'badges.isCertifiable': true,
      })
      .whereRaw(
        '"complementary-certification-badges".level = (select max(level) from "complementary-certification-badges" ccb join "badges" b on ccb."badgeId" = b.id join "badge-acquisitions" ba on ba."badgeId" = b.id where "complementary-certification-badges"."complementaryCertificationId" = ccb."complementaryCertificationId" and ba."userId" = ? and b."isCertifiable" = true)',
        userId
      );

    const certifiableBadgeAcquisitionBadgeIds = certifiableBadgeAcquisitions.map(
      (certifiableBadgeAcquisition) => certifiableBadgeAcquisition.badgeId
    );

    const badgeCriteria = await knexConn('badge-criteria').whereIn('badgeId', certifiableBadgeAcquisitionBadgeIds);

    const skillSetIds = badgeCriteria.flatMap((badgeCriterion) => badgeCriterion.skillSetIds);

    const uniqueSkillSetIds = [...new Set(skillSetIds)];

    const skillSets = await knexConn('skill-sets').whereIn('id', uniqueSkillSetIds);

    return _toDomain(certifiableBadgeAcquisitions, badgeCriteria, skillSets);
  },
};

function _toDomain(certifiableBadgeAcquisitionsDto, badgeCriteriaDto, skillSetsDto) {
  return certifiableBadgeAcquisitionsDto.map((certifiableBadgeAcquisitionDto) => {
    const skillSets = skillSetsDto
      .filter((skillSetDto) => skillSetDto.badgeId === certifiableBadgeAcquisitionDto.badgeId)
      .map((skillSetDto) => new SkillSet({ ...skillSetDto }));

    const badgeCriteria = badgeCriteriaDto
      .filter((badgeCriterionDto) => badgeCriterionDto.badgeId === certifiableBadgeAcquisitionDto.badgeId)
      .map((badgeCriterionDto) => new BadgeCriterion({ ...badgeCriterionDto }));
    const badge = new Badge({
      ...certifiableBadgeAcquisitionDto,
      id: certifiableBadgeAcquisitionDto.badgeId,
      badgeCriteria,
      skillSets,
      complementaryCertificationBadge: new ComplementaryCertificationBadge({
        id: certifiableBadgeAcquisitionDto.complementaryCertificationBadgeId,
        level: certifiableBadgeAcquisitionDto.complementaryCertificationBadgeLevel,
        label: certifiableBadgeAcquisitionDto.complementaryCertificationBadgeLabel,
        imageUrl: certifiableBadgeAcquisitionDto.complementaryCertificationBadgeImageUrl,
      }),
    });

    return new BadgeAcquisition({
      ...certifiableBadgeAcquisitionDto,
      badge,
    });
  });
}
