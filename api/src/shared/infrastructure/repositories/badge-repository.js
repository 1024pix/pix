import { knex } from '../../../../db/knex-database-connection.js';
import { Badge } from '../../../../src/shared/domain/models/Badge.js';
import * as knexUtils from '../../../../lib/infrastructure/utils/knex-utils.js';
import { AlreadyExistingEntityError, NotFoundError } from '../../domain/errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import omit from 'lodash/omit.js';

const TABLE_NAME = 'badges';

const findByCampaignId = async function (campaignId) {
  return knex(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .join('target-profiles', 'target-profiles.id', `${TABLE_NAME}.targetProfileId`)
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .orderBy('id');
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
  if (!badge) throw new NotFoundError('Badge not found');
  return new Badge(badge);
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

const findAllByIds = async function ({ ids }) {
  const badges = await knex.from('badges').whereIn('id', ids);

  return badges.map((badge) => {
    return new Badge(badge);
  });
};

export {
  findByCampaignId,
  isAssociated,
  isRelatedToCertification,
  get,
  save,
  update,
  isKeyAvailable,
  remove,
  findAllByIds,
};

function _adaptModelToDb(badge) {
  return omit(badge, ['id', 'badgeCriteria', 'complementaryCertificationBadge']);
}
