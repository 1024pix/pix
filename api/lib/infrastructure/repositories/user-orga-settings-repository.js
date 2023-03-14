import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { BookshelfUserOrgaSettings } from '../orm-models/UserOrgaSettings.js';
import * as knexUtils from '../utils/knex-utils.js';
import { UserOrgaSettingsCreationError } from '../../domain/errors.js';
import { knex } from '../../../db/knex-database-connection.js';
import { UserOrgaSettings } from '../../domain/models/UserOrgaSettings.js';

const findOneByUserId = function (userId) {
  return BookshelfUserOrgaSettings.where({ userId })
    .fetch({ require: true, withRelated: ['user', 'currentOrganization'] })
    .then((userOrgaSettings) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings)
    )
    .catch((err) => {
      if (err instanceof BookshelfUserOrgaSettings.NotFoundError) {
        return {};
      }
      throw err;
    });
};

const create = function (userId, currentOrganizationId) {
  return new BookshelfUserOrgaSettings({ userId, currentOrganizationId })
    .save()
    .then((bookshelfUserOrgaSettings) => bookshelfUserOrgaSettings.load(['user', 'currentOrganization']))
    .then((userOrgaSettings) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings)
    )
    .catch((err) => {
      if (knexUtils.isUniqConstraintViolated(err)) {
        throw new UserOrgaSettingsCreationError(err.message);
      }
      throw err;
    });
};

const update = async function (userId, organizationId) {
  const bookshelfUserOrgaSettings = await BookshelfUserOrgaSettings.where({ userId }).save(
    { currentOrganizationId: organizationId },
    { patch: true, method: 'update' }
  );
  await bookshelfUserOrgaSettings.related('user').fetch();
  await bookshelfUserOrgaSettings.related('currentOrganization').fetch();
  return bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, bookshelfUserOrgaSettings);
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

export { findOneByUserId, create, update, createOrUpdate };
