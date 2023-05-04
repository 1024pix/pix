import { BookshelfOrganizationInvitation } from '../orm-models/OrganizationInvitation.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { NotFoundError } from '../../domain/errors.js';
import { OrganizationInvitation } from '../../domain/models/OrganizationInvitation.js';
import { knex } from '../../../db/knex-database-connection.js';
import _ from 'lodash';

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

const create = function ({ organizationId, email, code, role }) {
  const status = OrganizationInvitation.StatusType.PENDING;
  return new BookshelfOrganizationInvitation({ organizationId, email, status, code, role }).save().then(_toDomain);
};

const get = function (id) {
  return BookshelfOrganizationInvitation.where({ id })
    .fetch()
    .then(_toDomain)
    .catch((err) => _checkNotFoundError(err, id));
};

const getByIdAndCode = function ({ id, code }) {
  return BookshelfOrganizationInvitation.where({ id, code })
    .fetch()
    .then(_toDomain)
    .catch((error) => _checkNotFoundErrorWithCode({ error, id, code }));
};

const markAsAccepted = function (id) {
  const status = OrganizationInvitation.StatusType.ACCEPTED;

  return new BookshelfOrganizationInvitation({ id })
    .save({ status }, { patch: true, require: true })
    .then((model) => model.refresh())
    .then(_toDomain)
    .catch((err) => _checkNotFoundError(err, id));
};

const markAsCancelled = async function ({ id }) {
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
};

const findPendingByOrganizationId = function ({ organizationId }) {
  return BookshelfOrganizationInvitation.where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
    .orderBy('updatedAt', 'desc')
    .fetchAll()
    .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationInvitation, results));
};

const findOnePendingByOrganizationIdAndEmail = function ({ organizationId, email }) {
  return BookshelfOrganizationInvitation.query((qb) =>
    qb
      .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
      .whereRaw('LOWER("email") = ?', `${email.toLowerCase()}`)
  )
    .fetch({ require: false })
    .then(_toDomain);
};

const updateModificationDate = async function (id) {
  const organizationInvitation = await knex('organization-invitations')
    .where({ id })
    .update({ updatedAt: new Date() })
    .returning('*')
    .then(_.first);

  if (!organizationInvitation) {
    throw new NotFoundError(`Organization invitation of id ${id} is not found.`);
  }
  return new OrganizationInvitation(organizationInvitation);
};

export {
  create,
  get,
  getByIdAndCode,
  markAsAccepted,
  markAsCancelled,
  findPendingByOrganizationId,
  findOnePendingByOrganizationIdAndEmail,
  updateModificationDate,
};
