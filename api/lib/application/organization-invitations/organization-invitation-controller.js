const usecases = require('../../domain/usecases');

module.exports = {

  async answerToOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const { code, status, email } = request.payload.data.attributes;

    await usecases.answerToOrganizationInvitation({ organizationInvitationId, code, status, email });
    return null;
  },

};
