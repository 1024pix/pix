const _ = require('lodash');

const { MissingQueryParamError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const scoOrganizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/sco-organization-invitation-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async answerToOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const { code, status, email } = request.payload.data.attributes;

    await usecases.answerToOrganizationInvitation({ organizationInvitationId, code, status, email });
    return null;
  },

  async sendScoInvitation(request, h) {

    const {
      'uai': uai,
      'first-name': firstName,
      'last-name': lastName,
    } = request.payload.data.attributes;

    const locale = extractLocaleFromRequest(request);

    const organizationSCOInvitation = await usecases.sendScoInvitation({ uai, firstName, lastName, locale });

    return h.response(scoOrganizationInvitationSerializer.serialize(organizationSCOInvitation)).created();
  },

  async getOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const organizationInvitationCode = request.query.code;

    if (_.isEmpty(organizationInvitationCode)) {
      throw new MissingQueryParamError('code');
    }

    const organizationInvitation = await usecases.getOrganizationInvitation({ organizationInvitationId, organizationInvitationCode });
    return organizationInvitationSerializer.serialize(organizationInvitation);
  },
};
