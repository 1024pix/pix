const { knex } = require('../../../db/knex-database-connection');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../orm-models/Badge');
const Badge = require('../../domain/models/Badge');
const BadgeCriterion = require('../../domain/models/BadgeCriterion');
const SkillSet = require('../../domain/models/SkillSet');
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

  async findByCampaignParticipationId({
    campaignParticipationId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const badges = await knexConn(TABLE_NAME)
      .select('badges.*')
      .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaign-participations.id', campaignParticipationId);

    const badgeIds = badges.map(({ id }) => id);

    const badgeCriteriaDto = await knexConn('badge-criteria').whereIn('badgeId', badgeIds);

    const skillSetsDto = await knexConn('skill-sets').whereIn('badgeId', badgeIds);

    const badgeCriteria = badgeCriteriaDto.map((badgeCriterion) => new BadgeCriterion(badgeCriterion));
    const skillSets = skillSetsDto.map((skillSet) => new SkillSet(skillSet));

    return badges.map((badge) => {
      return new Badge({
        ...badge,
        badgeCriteria: badgeCriteria.filter((badgeCriterion) => badgeCriterion.badgeId === badge.id),
        skillSets: skillSets.filter((skillSet) => skillSet.badgeId === badge.id),
      });
    });
  },

  async isAssociated(badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const associatedBadge = await (knexTransaction ?? knex)('badge-acquisitions').where({ badgeId }).first();
    return !!associatedBadge;
  },

  async isRelatedToCertification(badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const complementaryCertificationBadge = await (knexTransaction ?? knex)('complementary-certification-badges')
      .where({ badgeId })
      .first();
    return !!complementaryCertificationBadge;
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

  async save(badge, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    try {
      const [savedBadge] = await (knexTransaction ?? knex)(TABLE_NAME).insert(_adaptModelToDb(badge)).returning('*');
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

  async isKeyAvailable(key, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const result = await (knexTransaction ?? knex)(TABLE_NAME).select('key').where('key', key);
    if (result.length) {
      throw new AlreadyExistingEntityError(`The badge key ${key} already exists`);
    }
    return true;
  },

  async delete(badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const knexConn = knexTransaction ?? knex;
    await knexConn('badge-criteria').where({ badgeId }).del();
    await knexConn('skill-sets').where({ badgeId }).del();
    await knexConn('badges').where({ id: badgeId }).del();

    return true;
  },
};

function _adaptModelToDb(badge) {
  return omit(badge, ['id', 'badgeCriteria', 'skillSets', 'complementaryCertificationBadge']);
}
