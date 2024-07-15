import omit from 'lodash/omit.js';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError, NotFoundError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { Badge } from '../../domain/models/Badge.js';

const TABLE_NAME = 'badges';
const BADGE_KEY_UNIQUE_CONSTRAINT = 'badges_key_unique';

const findByCampaignId = async (campaignId) => {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection(TABLE_NAME)
    .select(`${TABLE_NAME}.*`)
    .join('target-profiles', 'target-profiles.id', `${TABLE_NAME}.targetProfileId`)
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .orderBy('id');
};

const isAssociated = async (badgeId) => {
  const knexConnection = DomainTransaction.getConnection();
  const associatedBadge = await knexConnection('badge-acquisitions').where({ badgeId }).first();
  return !!associatedBadge;
};

const get = async (id) => {
  const knexConnection = DomainTransaction.getConnection();
  const badge = await knexConnection(TABLE_NAME).select('*').where({ id }).first();
  if (!badge) throw new NotFoundError('Badge not found');
  return new Badge(badge);
};

const save = async (badge) => {
  const knexConnection = DomainTransaction.getConnection();
  const [savedBadge] = await saveAll([badge], { knexConnection });
  return savedBadge;
};

const saveAll = async (badges) => {
  const knexConnection = DomainTransaction.getConnection();
  try {
    const savedBadges = await knexConnection(TABLE_NAME).insert(badges.map(adaptModelToDb)).returning('*');
    return savedBadges.map((badge) => new Badge(badge));
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error) && error.constraint === BADGE_KEY_UNIQUE_CONSTRAINT) {
      throw new AlreadyExistingEntityError(error.detail);
    }
    throw error;
  }
};

const update = async (badge) => {
  try {
    const [updatedBadge] = await knex(TABLE_NAME).update(adaptModelToDb(badge)).where({ id: badge.id }).returning('*');
    return new Badge({ ...badge, ...updatedBadge });
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error) && error.constraint === BADGE_KEY_UNIQUE_CONSTRAINT) {
      throw new AlreadyExistingEntityError(
        `The badge key ${badge.key} already exists`,
        'BADGE_KEY_UNIQUE_CONSTRAINT_VIOLATED',
        badge.key,
      );
    }
    throw error;
  }
};

const remove = async (badgeId) => {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection('badge-criteria').where({ badgeId }).del();
  await knexConnection('badges').where({ id: badgeId }).del();

  return true;
};

const findAllByIds = async ({ ids }) => {
  const badges = await knex.from('badges').whereIn('id', ids);

  return badges.map((badge) => {
    return new Badge(badge);
  });
};

const findAllByTargetProfileId = async (targetProfileId) => {
  const knexConnection = DomainTransaction.getConnection();
  const badges = await knexConnection('badges').where({
    targetProfileId: targetProfileId,
  });

  return badges.map((badge) => new Badge(badge));
};

export { findAllByIds, findAllByTargetProfileId, findByCampaignId, get, isAssociated, remove, save, saveAll, update };

const adaptModelToDb = (badge) => omit(badge, ['id', 'badgeCriteria', 'complementaryCertificationBadge']);
