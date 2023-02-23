const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const BookshelfUserOrgaSettings = require('../orm-models/UserOrgaSettings.js');
const bookshelfUtils = require('../utils/knex-utils.js');
const { UserOrgaSettingsCreationError } = require('../../domain/errors.js');
const { knex } = require('../../../db/knex-database-connection.js');
const UserOrgaSettings = require('../../domain/models/UserOrgaSettings.js');

module.exports = {
  findOneByUserId(userId) {
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
  },

  create(userId, currentOrganizationId) {
    return new BookshelfUserOrgaSettings({ userId, currentOrganizationId })
      .save()
      .then((bookshelfUserOrgaSettings) => bookshelfUserOrgaSettings.load(['user', 'currentOrganization']))
      .then((userOrgaSettings) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings)
      )
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new UserOrgaSettingsCreationError(err.message);
        }
        throw err;
      });
  },

  async update(userId, organizationId) {
    const bookshelfUserOrgaSettings = await BookshelfUserOrgaSettings.where({ userId }).save(
      { currentOrganizationId: organizationId },
      { patch: true, method: 'update' }
    );
    await bookshelfUserOrgaSettings.related('user').fetch();
    await bookshelfUserOrgaSettings.related('currentOrganization').fetch();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, bookshelfUserOrgaSettings);
  },

  async createOrUpdate({ userId, organizationId }) {
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
  },
};
