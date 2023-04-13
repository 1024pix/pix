const _ = require('lodash');

const { MissingQueryParamError } = require('../http-errors.js');
const usecases = require('../../domain/usecases/index.js');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer.js');
const scoOrganizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/sco-organization-invitation-serializer.js');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async acceptOrganizationInvitation(request) {
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
    await usecases.createCertificationCenterMembershipForScoOrganizationMember({ membership });
    return null;
  },

  async sendScoInvitation(request, h) {
    const { uai, 'first-name': firstName, 'last-name': lastName } = request.payload.data.attributes;

    const locale = extractLocaleFromRequest(request);

    const organizationScoInvitation = await usecases.sendScoInvitation({ uai, firstName, lastName, locale });

    return h.response(scoOrganizationInvitationSerializer.serialize(organizationScoInvitation)).created();
  },

  async getOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const organizationInvitationCode = request.query.code;

    if (_.isEmpty(organizationInvitationCode)) {
      throw new MissingQueryParamError('code');
    }

    const organizationInvitation = await usecases.getOrganizationInvitation({
      organizationInvitationId,
      organizationInvitationCode,
    });
    return organizationInvitationSerializer.serialize(organizationInvitation);
  },
};
