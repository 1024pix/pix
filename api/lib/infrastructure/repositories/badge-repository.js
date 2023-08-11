import { knex } from '../../../db/knex-database-connection.js';
import { Badge, BadgeCriterion, SkillSet } from '../../domain/models/index.js';
import * as knexUtils from '../utils/knex-utils.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import { DomainTransaction } from '../DomainTransaction.js';
import lodash from 'lodash';
const { omit } = lodash;

const TABLE_NAME = 'badges';

const findByCampaignId = async function (campaignId) {
  const badges = await knex(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .join('target-profiles', 'target-profiles.id', `${TABLE_NAME}.targetProfileId`)
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId);

  return Promise.all(
    badges.map(async (badge) => {
      const { badgeCriteria, skillSets } = await _addCriteriaInformation(badge);
      return new Badge({ ...badge, badgeCriteria, skillSets });
    }),
  );
};

const isAssociated = async function (badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const associatedBadge = await (knexTransaction ?? knex)('badge-acquisitions').where({ badgeId }).first();
  return !!associatedBadge;
};

const isRelatedToCertification = async function (badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const complementaryCertificationBadge = await (knexTransaction ?? knex)('complementary-certification-badges')
    .where({ badgeId })
    .first();
  return !!complementaryCertificationBadge;
};

const get = async function (id) {
  const badge = await knex(TABLE_NAME).select('*').where({ id }).first();
  const { badgeCriteria, skillSets } = await _addCriteriaInformation(badge);
  return new Badge({ ...badge, badgeCriteria, skillSets });
};

const save = async function (badge, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  try {
    const [savedBadge] = await (knexTransaction ?? knex)(TABLE_NAME).insert(_adaptModelToDb(badge)).returning('*');
    return new Badge(savedBadge);
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError(`The badge key ${badge.key} already exists`);
    }
    throw err;
  }
};

const update = async function (badge) {
  const [updatedBadge] = await knex(TABLE_NAME).update(_adaptModelToDb(badge)).where({ id: badge.id }).returning('*');
  return new Badge({ ...badge, ...updatedBadge });
};

const isKeyAvailable = async function (key, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const result = await (knexTransaction ?? knex)(TABLE_NAME).select('key').where('key', key);
  if (result.length) {
    throw new AlreadyExistingEntityError(`The badge key ${key} already exists`);
  }
  return true;
};

const remove = async function (badgeId, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const knexConn = knexTransaction ?? knex;
  await knexConn('badge-criteria').where({ badgeId }).del();
  await knexConn('badges').where({ id: badgeId }).del();

  return true;
};

export { findByCampaignId, isAssociated, isRelatedToCertification, get, save, update, isKeyAvailable, remove };

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
