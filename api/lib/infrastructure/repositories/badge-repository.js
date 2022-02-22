const { knex } = require('../../../db/knex-database-connection');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../orm-models/Badge');
const Badge = require('../../domain/models/Badge');
const omit = require('lodash/omit');
const bookshelfUtils = require('../utils/knex-utils');
const { AlreadyExistingEntityError } = require('../../domain/errors');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const TABLE_NAME = 'badges';

module.exports = {
  findByTargetProfileId(targetProfileId) {
    return BookshelfBadge.where({ targetProfileId })
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'skillSets'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignId(campaignId) {
    return BookshelfBadge.query((qb) => {
      qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
      qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
    })
      .where('campaigns.id', campaignId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'skillSets'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignParticipationId(campaignParticipationId) {
    return BookshelfBadge.query((qb) => {
      qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
      qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
      qb.join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id');
    })
      .where('campaign-participations.id', campaignParticipationId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'skillSets'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  async isAssociated(badgeId, domainTransaction = DomainTransaction.emptyTransaction()) {
    const associatedBadge = await domainTransaction.knex('badge-acquisitions').where({ badgeId }).first();
    return !!associatedBadge;
  },

  async isRelatedToCertification(badgeId, domainTransaction = DomainTransaction.emptyTransaction()) {
    const partnerCertificationBadge = await domainTransaction
      .knex('partner-certifications')
      .join('badges', 'partnerKey', 'key')
      .where('badges.id', badgeId)
      .first();
    const complementaryCertificationBadge = await knex('complementary-certification-badges').where({ badgeId }).first();
    return !!(partnerCertificationBadge || complementaryCertificationBadge);
  },

  async get(id) {
    const bookshelfBadge = await BookshelfBadge.where('id', id).fetch({
      withRelated: ['badgeCriteria', 'skillSets'],
    });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, bookshelfBadge);
  },

  async getByKey(key) {
    const bookshelfBadge = await BookshelfBadge.where({ key }).fetch({
      withRelated: ['badgeCriteria', 'skillSets'],
    });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, bookshelfBadge);
  },

  async save(badge, domainTransaction = DomainTransaction.emptyTransaction()) {
    try {
      const [savedBadge] = await domainTransaction.knex(TABLE_NAME).insert(_adaptModelToDb(badge)).returning('*');
      return new Badge(savedBadge);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`The badge key ${badge.key} already exists`);
      }
      throw err;
    }
  },

  async update(badge) {
    const [updatedBadge] = await knex(TABLE_NAME).update(_adaptModelToDb(badge)).where({ id: badge.id }).returning('*');
    return new Badge({ ...badge, ...updatedBadge });
  },

  async isKeyAvailable(key, domainTransaction = DomainTransaction.emptyTransaction()) {
    const result = await domainTransaction.knex(TABLE_NAME).select('key').where('key', key);
    if (result.length) {
      throw new AlreadyExistingEntityError(`The badge key ${key} already exists`);
    }
    return true;
  },

  async delete(badgeId, domainTransaction = DomainTransaction.emptyTransaction()) {
    await domainTransaction.knex('badge-criteria').where({ badgeId }).del();
    await domainTransaction.knex('skill-sets').where({ badgeId }).del();
    await domainTransaction.knex('badges').where({ id: badgeId }).del();

    return true;
  },
};

function _adaptModelToDb(badge) {
  return omit(badge, ['id', 'badgeCriteria', 'skillSets']);
}
