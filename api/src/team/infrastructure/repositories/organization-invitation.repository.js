import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { OrganizationInvitation } from '../../domain/models/OrganizationInvitation.js';

/**
 * @param {Object} params
 * @param {string} params.organizationId
 * @param {string} params.email
 * @param {string} params.code
 * @param {string} params.role
 * @returns {Promise<OrganizationInvitation>}
 */
const create = async function ({ organizationId, email, code, role }) {
  const status = OrganizationInvitation.StatusType.PENDING;
  const [organizationInvitationCreated] = await knex('organization-invitations')
    .insert({ organizationId, email, status, code, role })
    .returning('*');

  return new OrganizationInvitation(organizationInvitationCreated);
};

/**
 * @param {string} id
 * @returns {Promise<OrganizationInvitation>}
 */
const get = async function (id) {
  const organizationInvitation = await knex('organization-invitations').where('id', id).first();
  if (!organizationInvitation) throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  return new OrganizationInvitation(organizationInvitation);
};

/**
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.code
 * @returns {Promise<OrganizationInvitation>}
 */
const getByIdAndCode = async function ({ id, code }) {
  const organizationInvitation = await knex('organization-invitations').where({ id, code }).first();
  if (!organizationInvitation)
    throw new NotFoundError(`Not found organization-invitation for ID ${id} and code ${code}`);
  return new OrganizationInvitation(organizationInvitation);
};

/**
 * @param {string} id
 * @returns {Promise<OrganizationInvitation>}
 */
const markAsAccepted = async function (id) {
  const status = OrganizationInvitation.StatusType.ACCEPTED;

  const [organizationInvitationAccepted] = await knex('organization-invitations')
    .where({ id })
    .update({ status, updatedAt: new Date() })
    .returning('*');
  if (!organizationInvitationAccepted) throw new NotFoundError(`Not found organization-invitation for ID ${id}`);
  return new OrganizationInvitation(organizationInvitationAccepted);
};

/**
 * @param {Object} params
 * @param {string} params.id
 * @returns {Promise<OrganizationInvitation>}
 */
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

/**
 * @param {Object} params
 * @param {string} params.organizationId
 * @returns {Promise<OrganizationInvitation>}
 */
const findPendingByOrganizationId = async function ({ organizationId }) {
  const pendingOrganizationInvitations = await knex('organization-invitations')
    .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
    .orderBy('updatedAt', 'desc');
  return pendingOrganizationInvitations.map((pendingOrganizationInvitation) => {
    return new OrganizationInvitation(pendingOrganizationInvitation);
  });
};

/**
 * @param {Object} params
 * @param {string} params.organizationId
 * @param {string} params.email
 * @returns {Promise<OrganizationInvitation>}
 */
const findOnePendingByOrganizationIdAndEmail = async function ({ organizationId, email }) {
  const pendingOrganizationInvitation = await knex('organization-invitations')
    .where({ organizationId, status: OrganizationInvitation.StatusType.PENDING })
    .whereRaw('LOWER("email") = ?', `${email.toLowerCase()}`)
    .first();
  if (!pendingOrganizationInvitation) return null;
  return new OrganizationInvitation(pendingOrganizationInvitation);
};

/**
 * @param {string} id
 * @returns {Promise<OrganizationInvitation>}
 */
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

export const organizationInvitationRepository = {
  create,
  findOnePendingByOrganizationIdAndEmail,
  findPendingByOrganizationId,
  get,
  getByIdAndCode,
  markAsAccepted,
  markAsCancelled,
  updateModificationDate,
};
