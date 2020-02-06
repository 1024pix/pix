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

function _checkNotFoundError(error, id) {
  if (error instanceof BookshelfOrganizationInvitation.NotFoundError) {
    throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  }
  throw error;
}

function _checkNotFoundErrorWithCode({ error, id, code }) {
  if (error instanceof BookshelfOrganizationInvitation.NotFoundError) {
    throw new NotFoundError(`Not found organization-invitation for ID ${id} and code ${code}`);
  }
  throw error;
}

module.exports = {

  create({ organizationId, email, code }) {
    const status = OrganizationInvitation.StatusType.PENDING;
    return new BookshelfOrganizationInvitation({ organizationId, email, status, code })
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

  getByIdAndCode({ id, code }) {
    return BookshelfOrganizationInvitation
      .where({ id, code })
      .fetch({ require: true })
      .then(_toDomain)
      .catch((error) => _checkNotFoundErrorWithCode({ error, id, code }));
  },

  markAsAccepted(id) {
    const status = OrganizationInvitation.StatusType.ACCEPTED;

    return new BookshelfOrganizationInvitation({ id })
      .save({ status }, { patch: true, require: true })
      .then((model) => model.refresh())
      .then(_toDomain)
      .catch((err) => _checkNotFoundError(err, id));
  },

  findPendingByOrganizationId({ organizationId }) {
    return BookshelfOrganizationInvitation
      .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
      .fetchAll()
      .then((results) =>  bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationInvitation, results));
  },

  findOnePendingByOrganizationIdAndEmail({ organizationId, email }) {
    return BookshelfOrganizationInvitation
      .query((qb) =>
        qb.where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
          .whereRaw('LOWER("email") = ?', `${email.toLowerCase()}`))
      .fetch({ required: false })
      .then(_toDomain);
  },

};
