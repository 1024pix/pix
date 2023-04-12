const { knex } = require('../../../db/knex-database-connection.js');
const Badge = require('../../domain/models/Badge.js');
const SkillSet = require('../../domain/models/SkillSet.js');
const BadgeCriterion = require('../../domain/models/BadgeCriterion.js');
const omit = require('lodash/omit');
const knexUtils = require('../utils/knex-utils.js');
const { AlreadyExistingEntityError } = require('../../domain/errors.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

const TABLE_NAME = 'badges';

module.exports = {
  async findByCampaignId(campaignId) {
    const badges = await knex(TABLE_NAME)
      .select(`${TABLE_NAME}.*`)
      .join('target-profiles', 'target-profiles.id', `${TABLE_NAME}.targetProfileId`)
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
      .where('campaigns.id', campaignId);

    return Promise.all(
      badges.map(async (badge) => {
        const { badgeCriteria, skillSets } = await _addCriteriaInformation(badge);
        return new Badge({ ...badge, badgeCriteria, skillSets });
      })
    );
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
    const badge = await knex(TABLE_NAME).select('*').where({ id }).first();
    const { badgeCriteria, skillSets } = await _addCriteriaInformation(badge);
    return new Badge({ ...badge, badgeCriteria, skillSets });
  },

  async getByKey(key) {
    const badge = await knex(TABLE_NAME).select('*').where({ key }).first();
    const { badgeCriteria, skillSets } = await _addCriteriaInformation(badge);
    return new Badge({ ...badge, badgeCriteria, skillSets });
  },

  async save(badge, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    try {
      const [savedBadge] = await (knexTransaction ?? knex)(TABLE_NAME).insert(_adaptModelToDb(badge)).returning('*');
      return new Badge(savedBadge);
    } catch (err) {
      if (knexUtils.isUniqConstraintViolated(err)) {
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

async function _addCriteriaInformation(badge) {
  const badgeCriteria = await knex('badge-criteria').where({ badgeId: badge.id });
  const skillSets = await knex('skill-sets').where({ badgeId: badge.id });

  return {
    badgeCriteria: badgeCriteria.map((badgeCriterion) => new BadgeCriterion(badgeCriterion)),
    skillSets: skillSets.map((skillSet) => new SkillSet(skillSet)),
  };
}

function _adaptModelToDb(badge) {
  return omit(badge, ['id', 'badgeCriteria', 'skillSets', 'complementaryCertificationBadge']);
}
