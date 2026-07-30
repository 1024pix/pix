import { User } from '../../../identity-access-management/domain/models/User.js';
import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserOrgaSettingsCreationError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { UserOrgaSettings } from '../../domain/models/UserOrgaSettings.js';

/**
 * @param {string} userId
 * @return {Promise<UserOrgaSettings|null>}
 */
const findOneByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const userOrgaSettings = await knexConn('user-orga-settings').where({ userId }).first();
  if (!userOrgaSettings) return null;

  const user = await knexConn('users').where('id', userId).first();
  const currentOrganization = await knexConn('organizations')
    .where('id', userOrgaSettings.currentOrganizationId)
    .first();

  return new UserOrgaSettings({
    id: userOrgaSettings.id,
    currentOrganization: new Organization(currentOrganization),
    user: new User(user),
  });
};

/**
 * @param {string} userId
 * @param {string} currentOrganizationId
 * @return {Promise<UserOrgaSettings>}
 */
const create = async function (userId, currentOrganizationId) {
  try {
    const knexConn = DomainTransaction.getConnection();
    const [userOrgaSettingsCreated] = await knexConn('user-orga-settings')
      .insert({ userId, currentOrganizationId, createdAt: new Date() })
      .returning('*');
    const user = await knexConn('users').where('id', userId).first();
    const currentOrganization = await knexConn('organizations')
      .where('id', userOrgaSettingsCreated.currentOrganizationId)
      .first();

    return new UserOrgaSettings({
      id: userOrgaSettingsCreated.id,
      user: new User(user),
      currentOrganization: new Organization(currentOrganization),
    });
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new UserOrgaSettingsCreationError(err.message);
    }
    throw err;
  }
};

/**
 * @param {string} userId
 * @param {string} organizationId
 * @return {Promise<UserOrgaSettings>}
 */
const update = async function (userId, organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const [userOrgaSettingsUpdated] = await knexConn('user-orga-settings')
    .where({ userId })
    .update({ currentOrganizationId: organizationId, updatedAt: new Date() })
    .returning('*');
  const user = await knexConn('users').where('id', userId).first();
  const currentOrganization = await knexConn('organizations')
    .where('id', userOrgaSettingsUpdated.currentOrganizationId)
    .first();
  return new UserOrgaSettings({
    id: userOrgaSettingsUpdated.id,
    createdAt: userOrgaSettingsUpdated.createdAt,
    updatedAt: userOrgaSettingsUpdated.updatedAt,
    user,
    currentOrganization,
  });
};

/**
 * @param {{userId: string, organizationId: string}} params
 * @return {Promise<UserOrgaSettings>}
 */
const createOrUpdate = async function ({ userId, organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const knexUserOrgaSetting = (
    await knexConn('user-orga-settings')
      .insert({ userId, currentOrganizationId: organizationId })
      .onConflict('userId')
      .merge()
      .returning('*')
  )[0];

  const user = await knexConn('users').where({ id: knexUserOrgaSetting.userId }).first();

  const organization = await knexConn('organizations').where({ id: knexUserOrgaSetting.currentOrganizationId }).first();

  return new UserOrgaSettings({
    id: knexUserOrgaSetting.id,
    user,
    currentOrganization: organization,
  });
};

export const userOrgaSettingsRepository = { create, createOrUpdate, findOneByUserId, update };
