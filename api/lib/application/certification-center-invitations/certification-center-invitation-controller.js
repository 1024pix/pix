const usecases = require('../../domain/usecases');
const certificationCenterInvitationSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer');

module.exports = {
  async getCertificationCenterInvitation(request) {
    const certificationCenterInvitationId = request.params.id;
    const certificationCenterInvitationCode = request.query.code;

    const certificationCenterInvitation = await usecases.getCertificationCenterInvitation({
      certificationCenterInvitationId,
      certificationCenterInvitationCode,
    });
    return certificationCenterInvitationSerializer.serialize(certificationCenterInvitation);
  },
};
