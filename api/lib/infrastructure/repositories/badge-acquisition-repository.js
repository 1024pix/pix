const Bookshelf = require('../bookshelf');
const { knex } = require('../../../db/knex-database-connection');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../orm-models/BadgeAcquisition');
const DomainTransaction = require('../DomainTransaction');
const bluebird = require('bluebird');
const BadgeAcquisition = require('../../domain/models/BadgeAcquisition');
const Badge = require('../../domain/models/Badge');
const BadgeCriterion = require('../../domain/models/BadgeCriterion');
const SkillSet = require('../../domain/models/SkillSet');
const ComplementaryCertificationBadge = require('../../domain/models/ComplementaryCertificationBadge');

module.exports = {
  async createOrUpdate(badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
    return bluebird.mapSeries(badgeAcquisitionsToCreate, async (badgeAcquisitionToCreate) => {
      const alreadyCreatedBadgeAcquisition = await knexConn('badge-acquisitions')
        .select('id')
        .where(badgeAcquisitionToCreate);
      if (alreadyCreatedBadgeAcquisition.length === 0) {
        return knexConn('badge-acquisitions').insert(badgeAcquisitionsToCreate);
      } else {
        return knexConn('badge-acquisitions')
          .update({ updatedAt: Bookshelf.knex.raw('CURRENT_TIMESTAMP') })
          .where(badgeAcquisitionToCreate);
      }
    });
  },

  async getAcquiredBadgeIds({ badgeIds, userId }) {
    const collectionResult = await BookshelfBadgeAcquisition.where({ userId })
      .where('badgeId', 'in', badgeIds)
      .fetchAll({ columns: ['badge-acquisitions.badgeId'], require: false });
    return collectionResult.map((obj) => obj.attributes.badgeId);
  },

  async getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds }) {
    const badges = await Bookshelf.knex('badges')
      .distinct('badges.id')
      .select('badge-acquisitions.campaignParticipationId AS campaignParticipationId', 'badges.*')
      .from('badges')
      .join('badge-acquisitions', 'badges.id', 'badge-acquisitions.badgeId')
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
    const certifiableBadgeAcquisitions = await knexConn('badge-acquisitions')
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

    const badgeCriteria = await knex('badge-criteria').whereIn('badgeId', certifiableBadgeAcquisitionBadgeIds);

    const skillSetIds = badgeCriteria.flatMap((badgeCriterion) => badgeCriterion.skillSetIds);

    const uniqueSkillSetIds = [...new Set(skillSetIds)];

    const skillSets = await knex('skill-sets').whereIn('id', uniqueSkillSetIds);

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
