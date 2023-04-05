const usecases = require('../../domain/usecases/index.js');
const certificationCenterInvitationSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js');

module.exports = {
  async acceptCertificationCenterInvitation(request, h) {
    const certificationCenterInvitationId = request.params.id;
    const { code, email: rawEmail } = request.deserializedPayload;
    const localeFromCookie = request.state?.locale;
    const email = rawEmail.trim().toLowerCase();

    await usecases.acceptCertificationCenterInvitation({
      certificationCenterInvitationId,
      code,
      email,
      localeFromCookie,
    });
    return h.response({}).code(204);
  },

  async getCertificationCenterInvitation(request) {
    const certificationCenterInvitationId = request.params.id;
    const certificationCenterInvitationCode = request.query.code;

    const certificationCenterInvitation = await usecases.getCertificationCenterInvitation({
      certificationCenterInvitationId,
      certificationCenterInvitationCode,
    });
    return certificationCenterInvitationSerializer.serialize(certificationCenterInvitation);
  },

  async cancelCertificationCenterInvitation(request, h) {
    const certificationCenterInvitationId = request.params.certificationCenterInvitationId;
    await usecases.cancelCertificationCenterInvitation({ certificationCenterInvitationId });
    return h.response().code(204);
  },
};
