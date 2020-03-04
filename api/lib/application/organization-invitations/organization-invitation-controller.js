const _ = require('lodash');
const usecases = require('../../domain/usecases');
const infraErrors = require('../../application/errors');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');

module.exports = {

  async answerToOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const { code, status, email } = request.payload.data.attributes;

    await usecases.answerToOrganizationInvitation({ organizationInvitationId, code, status, email });
    return null;
  },

  async getOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const organizationInvitationCode = request.query.code;

    if (_.isEmpty(organizationInvitationCode)) {
      throw new infraErrors.MissingQueryParamError('code');
    }

    const organizationInvitation = await usecases.getOrganizationInvitation({ organizationInvitationId, organizationInvitationCode });
    return organizationInvitationSerializer.serialize(organizationInvitation);
  },
};
