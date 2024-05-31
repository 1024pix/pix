import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/sco-organization-invitation-serializer.js';

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
  sendScoInvitation,
};
