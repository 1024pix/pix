const BookshelfOrganizationInvitation = require('../orm-models/OrganizationInvitation');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../domain/errors');
const OrganizationInvitation = require('../../domain/models/OrganizationInvitation');
const { knex } = require('../../../db/knex-database-connection');
const _ = require('lodash');

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
  create({ organizationId, email, code, role }) {
    const status = OrganizationInvitation.StatusType.PENDING;
    return new BookshelfOrganizationInvitation({ organizationId, email, status, code, role }).save().then(_toDomain);
  },

  get(id) {
    return BookshelfOrganizationInvitation.where({ id })
      .fetch()
      .then(_toDomain)
      .catch((err) => _checkNotFoundError(err, id));
  },

  getByIdAndCode({ id, code }) {
    return BookshelfOrganizationInvitation.where({ id, code })
      .fetch()
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

  async markAsCancelled({ id }) {
    const [organizationInvitation] = await knex('organization-invitations')
      .where({ id })
      .update({
        status: OrganizationInvitation.StatusType.CANCELLED,
        updatedAt: new Date(),
      })
      .returning('*');

    if (!organizationInvitation) {
      throw new NotFoundError(`Organization invitation of id ${id} is not found.`);
    }
    return new OrganizationInvitation(organizationInvitation);
  },

  findPendingByOrganizationId({ organizationId }) {
    return BookshelfOrganizationInvitation.where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
      .orderBy('updatedAt', 'desc')
      .fetchAll()
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationInvitation, results));
  },

  findOnePendingByOrganizationIdAndEmail({ organizationId, email }) {
    return BookshelfOrganizationInvitation.query((qb) =>
      qb
        .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
        .whereRaw('LOWER("email") = ?', `${email.toLowerCase()}`)
    )
      .fetch({ require: false })
      .then(_toDomain);
  },

  async updateModificationDate(id) {
    const organizationInvitation = await knex('organization-invitations')
      .where({ id })
      .update({ updatedAt: new Date() })
      .returning('*')
      .then(_.first);

    if (!organizationInvitation) {
      throw new NotFoundError(`Organization invitation of id ${id} is not found.`);
    }
    return new OrganizationInvitation(organizationInvitation);
  },
};
