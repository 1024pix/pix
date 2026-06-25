import _ from 'lodash';

import { MissingQueryParamError } from '../../../shared/application/errors/http-errors.js';
import { getUserLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { organizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/organization-invitation.serializer.js';
import { scoOrganizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';

const acceptOrganizationInvitation = async function (request) {
  const organizationInvitationId = request.params.id;
  const { code, 'user-id': userId } = request.payload.data.attributes;
  const locale = getUserLocale(request);

  const membership = await usecases.acceptOrganizationInvitation({
    organizationInvitationId,
    code,
    userId,
    locale,
  });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });
  return null;
};

/**
 *
 * @param request
 * @param h
 * @returns {Promise<any>}
 */
const findPendingInvitations = function (request, h, dependencies = { organizationInvitationSerializer }) {
  const organizationId = request.params.id;

  return usecases
    .findPendingOrganizationInvitations({ organizationId })
    .then((invitations) => dependencies.organizationInvitationSerializer.serialize(invitations));
};

/**
 *
 * @param request
 * @param h
 * @returns {Promise<any>}
 */
const cancelOrganizationInvitation = async function (request, h) {
  const organizationInvitationId = request.params.organizationInvitationId;
  await usecases.cancelOrganizationInvitation({ organizationInvitationId });
  return h.response().code(204);
};

/**
 *
 * @param request
 * @param h
 * @param dependencies
 * @returns {Promise<OrganizationInvitation>}
 */
const getOrganizationInvitation = async function (request, h, dependencies = { organizationInvitationSerializer }) {
  const organizationInvitationId = request.params.id;
  const organizationInvitationCode = request.query.code;

  if (_.isEmpty(organizationInvitationCode)) {
    throw new MissingQueryParamError('code');
  }

  const organizationInvitation = await usecases.getOrganizationInvitation({
    organizationInvitationId,
    organizationInvitationCode,
  });
  return dependencies.organizationInvitationSerializer.serialize(organizationInvitation);
};

/**
 *
 * @param request
 * @param h
 * @param dependencies
 * @returns {Promise<void>}
 */
const sendScoInvitation = async function (request, h, dependencies = { scoOrganizationInvitationSerializer }) {
  const { uai, 'first-name': firstName, 'last-name': lastName } = request.payload.data.attributes;
  const locale = getUserLocale(request);

  const organizationScoInvitation = await usecases.sendScoInvitation({
    uai,
    firstName,
    lastName,
    locale,
  });

  return h.response(dependencies.scoOrganizationInvitationSerializer.serialize(organizationScoInvitation)).created();
};

const sendInvitations = async function (request, h) {
  const organizationId = request.params.id;
  const emails = request.payload.data.attributes.email.split(',');
  const locale = getUserLocale(request);

  const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails, locale });
  return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
};

const resendInvitation = async function (request, h) {
  const organizationId = request.params.id;
  const email = request.payload.data.attributes.email;

  const organizationInvitation = await usecases.resendOrganizationInvitation({
    organizationId,
    email,
  });
  return h.response(organizationInvitationSerializer.serialize(organizationInvitation));
};

/**
 *
 * @param request
 * @param h
 * @param dependencies
 * @returns {Promise<any>}
 */
const sendInvitationByLocaleAndRole = async function (request, h, dependencies = { organizationInvitationSerializer }) {
  const organizationId = request.params.id;
  const invitationInformation =
    await dependencies.organizationInvitationSerializer.deserializeForCreateOrganizationInvitationAndSendEmail(
      request.payload,
    );

  const organizationInvitation = await usecases.createOrganizationInvitationByAdmin({
    organizationId,
    email: invitationInformation.email,
    locale: invitationInformation.locale,
    role: invitationInformation.role,
  });
  return h.response(dependencies.organizationInvitationSerializer.serialize(organizationInvitation)).created();
};

export const organizationInvitationController = {
  acceptOrganizationInvitation,
  findPendingInvitations,
  cancelOrganizationInvitation,
  getOrganizationInvitation,
  resendInvitation,
  sendInvitations,
  sendScoInvitation,
  sendInvitationByLocaleAndRole,
};
