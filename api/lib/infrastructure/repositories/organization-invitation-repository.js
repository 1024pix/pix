import { NotFoundError } from '../../domain/errors.js';
import { OrganizationInvitation } from '../../domain/models/OrganizationInvitation.js';
import { knex } from '../../../db/knex-database-connection.js';
import _ from 'lodash';

const create = async function ({ organizationId, email, code, role }) {
  const status = OrganizationInvitation.StatusType.PENDING;
  const [organizationInvitationCreated] = await knex('organization-invitations')
    .insert({ organizationId, email, status, code, role })
    .returning('*');

  return new OrganizationInvitation(organizationInvitationCreated);
};

const get = async function (id) {
  const organizationInvitation = await knex('organization-invitations').where('id', id).first();
  if (!organizationInvitation) throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  return new OrganizationInvitation(organizationInvitation);
};

const getByIdAndCode = async function ({ id, code }) {
  const organizationInvitation = await knex('organization-invitations').where({ id, code }).first();
  if (!organizationInvitation)
    throw new NotFoundError(`Not found organization-invitation for ID ${id} and code ${code}`);
  return new OrganizationInvitation(organizationInvitation);
};

const markAsAccepted = async function (id) {
  const status = OrganizationInvitation.StatusType.ACCEPTED;

  const [organizationInvitationAccepted] = await knex('organization-invitations')
    .where({ id })
    .update({ status, updatedAt: new Date() })
    .returning('*');
  if (!organizationInvitationAccepted) throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  return new OrganizationInvitation(organizationInvitationAccepted);
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

const findPendingByOrganizationId = async function ({ organizationId }) {
  const pendingOrganizationInvitations = await knex('organization-invitations')
    .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
    .orderBy('updatedAt', 'desc');
  return pendingOrganizationInvitations.map((pendingOrganizationInvitation) => {
    return new OrganizationInvitation(pendingOrganizationInvitation);
  });
};

const findOnePendingByOrganizationIdAndEmail = async function ({ organizationId, email }) {
  const pendingOrganizationInvitation = await knex('organization-invitations')
    .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
    .whereRaw('LOWER("email") = ?', `${email.toLowerCase()}`)
    .first();
  if (!pendingOrganizationInvitation) return null;
  return new OrganizationInvitation(pendingOrganizationInvitation);
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
