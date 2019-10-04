const BookshelfOrganizationInvitation = require('../data/organization-invitation');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../domain/errors');
const OrganizationInvitation = require('../../domain/models/OrganizationInvitation');

function _toDomain(bookshelfInvitation) {
  if (bookshelfInvitation) {
    return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationInvitation, bookshelfInvitation);
  }
  return null;
}

function _checkNotFoundError(err, id) {
  if (err instanceof BookshelfOrganizationInvitation.NotFoundError) {
    throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  }
  throw err;
}

function _checkNotFoundErrorWithTemporaryKey(err, id, temporaryKey) {
  if (err instanceof BookshelfOrganizationInvitation.NotFoundError) {
    throw new NotFoundError(`Not found organization-invitation for ID ${id} and temporaryKey ${temporaryKey}`);
  }
  throw err;
}

module.exports = {

  create(organizationId, email, temporaryKey) {
    const status = OrganizationInvitation.StatusType.PENDING;
    return new BookshelfOrganizationInvitation({ organizationId, email, status, temporaryKey })
      .save()
      .then(_toDomain);
  },

  get(id) {
    return BookshelfOrganizationInvitation
      .where({ id })
      .fetch({ require: true })
      .then(_toDomain)
      .catch((err) => _checkNotFoundError(err, id));
  },

  getByIdAndTemporaryKey({ id, temporaryKey }) {
    return BookshelfOrganizationInvitation
      .where({ id, temporaryKey })
      .fetch({ require: true })
      .then(_toDomain)
      .catch((err) => _checkNotFoundErrorWithTemporaryKey(err, id, temporaryKey));
  },

  markAsAccepted(id) {
    const status = OrganizationInvitation.StatusType.ACCEPTED;

    return new BookshelfOrganizationInvitation({ id })
      .save({ status }, { patch: true, require: true })
      .then((model) => model.refresh())
      .then(_toDomain)
      .catch((err) => _checkNotFoundError(err, id));
  },

  findByOrganizationIdAndEmail({ organizationId, email }) {
    return BookshelfOrganizationInvitation
      .where({ organizationId, email })
      .fetchAll()
      .then((results) =>  bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationInvitation, results));
  },

};
