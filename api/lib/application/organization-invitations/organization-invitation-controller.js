const usecases = require('../../domain/usecases');

module.exports = {

  async answerToOrganizationInvitation(request) {
    const organizationInvitationId = request.params.id;
    const { code, status } = request.payload.data.attributes;

    return usecases.answerToOrganizationInvitation({ organizationInvitationId, code, status, })
      .then(() => null);
  },

};
