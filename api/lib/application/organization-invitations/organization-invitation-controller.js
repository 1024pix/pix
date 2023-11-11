import _ from 'lodash';

import { MissingQueryParamError } from '../http-errors.js';
import { usecases } from '../../domain/usecases/index.js';
import * as organizationInvitationSerializer from '../../infrastructure/serializers/jsonapi/organization-invitation-serializer.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../infrastructure/serializers/jsonapi/sco-organization-invitation-serializer.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';

const acceptOrganizationInvitation = async function (request) {
  const organizationInvitationId = request.params.id;
  const { code, email: rawEmail } = request.payload.data.attributes;
  const localeFromCookie = request.state?.locale;
  const email = rawEmail?.trim().toLowerCase();

  const membership = await usecases.acceptOrganizationInvitation({
    organizationInvitationId,
    code,
    email,
    localeFromCookie,
  });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });
  return null;
};

const sendScoInvitation = async function (
  request,
  h,
  dependencies = { requestResponseUtils, scoOrganizationInvitationSerializer },
) {
  const { uai, 'first-name': firstName, 'last-name': lastName } = request.payload.data.attributes;

  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const organizationScoInvitation = await usecases.sendScoInvitation({ uai, firstName, lastName, locale });

  return h.response(dependencies.scoOrganizationInvitationSerializer.serialize(organizationScoInvitation)).created();
};

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

const organizationInvitationController = { acceptOrganizationInvitation, sendScoInvitation, getOrganizationInvitation };
export { organizationInvitationController };
