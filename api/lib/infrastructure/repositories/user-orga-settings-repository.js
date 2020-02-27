const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfUserOrgaSettings = require('../data/user-orga-settings');
const bookshelfUtils = require('../utils/bookshelf-utils');
const { UserOrgaSettingsCreationError } = require('../../domain/errors');

module.exports = {

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
  }
};
