const Bookshelf = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadgeAcquisition = require('../orm-models/BadgeAcquisition');
const DomainTransaction = require('../DomainTransaction');
const bluebird = require('bluebird');

module.exports = {
  async createOrUpdate(badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
    return bluebird.mapSeries(badgeAcquisitionsToCreate, async (badgeAcquisitionToCreate) => {
      const alreadyCreatedBadgeAcquisition = await knexConn('badge-acquisitions')
        .select('id')
        .where(badgeAcquisitionToCreate);
      if (alreadyCreatedBadgeAcquisition.length === 0) {
        return knexConn('badge-acquisitions').insert(badgeAcquisitionsToCreate, 'id');
      } else {
        return knexConn('badge-acquisitions')
          .update({ updatedAt: Bookshelf.knex.raw('CURRENT_TIMESTAMP') })
          .where(badgeAcquisitionToCreate);
      }
    });
  },

  async hasAcquiredBadge({ badgeKey, userId }) {
    const badgeAcquisition = await Bookshelf.knex('badge-acquisitions')
      .select('badge-acquisitions.id')
      .innerJoin('badges', 'badges.id', 'badgeId')
      .where({ userId, key: badgeKey })
      .first();
    return Boolean(badgeAcquisition);
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

  async getCampaignAcquiredBadgesByUsers({ campaignId, userIds }) {
    const results = await BookshelfBadgeAcquisition.query((qb) => {
      qb.join('badges', 'badges.id', 'badge-acquisitions.badgeId');
      qb.join('campaigns', 'campaigns.targetProfileId', 'badges.targetProfileId');
      qb.where('campaigns.id', '=', campaignId);
      qb.where('badge-acquisitions.userId', 'IN', userIds);
    }).fetchAll({
      withRelated: ['badge'],
      require: false,
    });

    const badgeAcquisitions = results.map((result) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfBadgeAcquisition, result)
    );

    const acquiredBadgesByUsers = {};
    for (const badgeAcquisition of badgeAcquisitions) {
      const { userId, badge } = badgeAcquisition;
      if (acquiredBadgesByUsers[userId]) {
        acquiredBadgesByUsers[userId].push(badge);
      } else {
        acquiredBadgesByUsers[userId] = [badge];
      }
    }
    return acquiredBadgesByUsers;
  },

  async findCertifiable({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const results = await BookshelfBadgeAcquisition.query((qb) => {
      qb.join('badges', 'badges.id', 'badge-acquisitions.badgeId');
      qb.where('badge-acquisitions.userId', '=', userId);
      qb.where('badges.isCertifiable', '=', true);
    }).fetchAll({
      withRelated: ['badge', 'badge.skillSets', 'badge.badgeCriteria'],
      require: false,
      transacting: domainTransaction.knexTransaction,
    });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfBadgeAcquisition, results);
  },
};
