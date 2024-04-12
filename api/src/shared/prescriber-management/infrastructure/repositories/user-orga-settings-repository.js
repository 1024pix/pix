import { knex } from '../../../../../db/knex-database-connection.js';
import { UserOrgaSettingsCreationError } from '../../../../../lib/domain/errors.js';
import { Organization, User } from '../../../../../lib/domain/models/index.js';
import { UserOrgaSettings } from '../../../../../lib/domain/models/UserOrgaSettings.js';
import * as knexUtils from '../../../infrastructure/utils/knex-utils.js';

const findOneByUserId = async function (userId) {
  const userOrgaSettings = await knex('user-orga-settings').where({ userId }).first();
  if (!userOrgaSettings) return {};

  const user = await knex('users').where('id', userId).first();
  const currentOrganization = await knex('organizations').where('id', userOrgaSettings.currentOrganizationId).first();

  return new UserOrgaSettings({
    id: userOrgaSettings.id,
    currentOrganization: new Organization(currentOrganization),
    user: new User(user),
  });
};

const create = async function (userId, currentOrganizationId) {
  try {
    const [userOrgaSettingsCreated] = await knex('user-orga-settings')
      .insert({ userId, currentOrganizationId, createdAt: new Date() })
      .returning('*');
    const user = await knex('users').where('id', userId).first();
    const currentOrganization = await knex('organizations')
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

const update = async function (userId, organizationId) {
  const [userOrgaSettingsUpdated] = await knex('user-orga-settings')
    .where({ userId })
    .update({ currentOrganizationId: organizationId, updatedAt: new Date() })
    .returning('*');
  const user = await knex('users').where('id', userId).first();
  const currentOrganization = await knex('organizations')
    .where('id', userOrgaSettingsUpdated.currentOrganizationId)
    .first();
  return new UserOrgaSettings({ id: userOrgaSettingsUpdated.id, user, currentOrganization });
};

const createOrUpdate = async function ({ userId, organizationId }) {
  const knexUserOrgaSetting = (
    await knex('user-orga-settings')
      .insert({ userId, currentOrganizationId: organizationId })
      .onConflict('userId')
      .merge()
      .returning('*')
  )[0];

  const user = await knex('users').where({ id: knexUserOrgaSetting.userId }).first();

  const organization = await knex('organizations').where({ id: knexUserOrgaSetting.currentOrganizationId }).first();

  return new UserOrgaSettings({
    id: knexUserOrgaSetting.id,
    user,
    currentOrganization: organization,
  });
};

export { create, createOrUpdate, findOneByUserId, update };
