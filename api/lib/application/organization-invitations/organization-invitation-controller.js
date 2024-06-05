import _ from 'lodash';

import { usecases } from '../../domain/usecases/index.js';
import * as organizationInvitationSerializer from '../../infrastructure/serializers/jsonapi/organization-invitation-serializer.js';
import { MissingQueryParamError } from '../http-errors.js';

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

const organizationInvitationController = { acceptOrganizationInvitation, getOrganizationInvitation };
export { organizationInvitationController };
