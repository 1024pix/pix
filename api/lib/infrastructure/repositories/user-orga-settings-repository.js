const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfUserOrgaSettings = require('../data/user-orga-settings');
const bookshelfUtils = require('../utils/bookshelf-utils');
const { UserOrgaSettingsCreationError } = require('../../domain/errors');

module.exports = {

  findOneByUserId(userId) {
    return BookshelfUserOrgaSettings
      .where({ userId })
      .fetch({ require: true, withRelated: ['user', 'currentOrganization'] })
      .then((userOrgaSettings) => bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings))
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
      .then((userOrgaSettings) => bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings))
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new UserOrgaSettingsCreationError(err.message);
        }
        throw err;
      });
  },

  update(userId, organizationId) {
    return BookshelfUserOrgaSettings
      .where({ userId })
      .save({ currentOrganizationId: organizationId }, { patch: true, method: 'update' })
      .then((bookshelfUserOrgaSettings) => bookshelfUserOrgaSettings.refresh({ withRelated: ['user', 'currentOrganization'] }))
      .then((userOrgaSettings) => bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, userOrgaSettings));
  }
};
