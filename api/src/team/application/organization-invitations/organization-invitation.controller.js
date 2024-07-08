import _ from 'lodash';

import { MissingQueryParamError } from '../../../../lib/application/http-errors.js';
import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { organizationInvitationSerializer as organizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/organization-invitation.serializer.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';

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
const sendScoInvitation = async function (
  request,
  h,
  dependencies = { requestResponseUtils, scoOrganizationInvitationSerializer },
) {
  const { uai, 'first-name': firstName, 'last-name': lastName } = request.payload.data.attributes;

  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const organizationScoInvitation = await usecases.sendScoInvitation({
    uai,
    firstName,
    lastName,
    locale,
  });

  return h.response(dependencies.scoOrganizationInvitationSerializer.serialize(organizationScoInvitation)).created();
};

export const organizationInvitationController = {
  cancelOrganizationInvitation,
  getOrganizationInvitation,
  sendScoInvitation,
};
