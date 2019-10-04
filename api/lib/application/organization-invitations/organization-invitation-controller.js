const usecases = require('../../domain/usecases');

module.exports = {

  async answerToOrganizationInvitation(request, h) {
    const organizationInvitationId = request.params.id;
    const { 'temporary-key': temporaryKey, status } = request.payload.data.attributes;

    await usecases.answerToOrganizationInvitation({ organizationInvitationId, temporaryKey, status, });

    return h.response().code(204);
  },

};
