const usecases = require('../../domain/usecases');
const events = require('../../domain/events');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const privateCertificateSerializer = require('../../infrastructure/serializers/jsonapi/private-certificate-serializer');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');

module.exports = {
  async findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
    return privateCertificateSerializer.serialize(privateCertificates);
  },

  async getCertification(request) {
    const userId = request.auth.credentials.userId;
    const certificationId = parseInt(request.params.id);

    const privateCertificate = await usecases.getPrivateCertificate({
      userId,
      certificationId,
    });
    return privateCertificateSerializer.serialize(privateCertificate);
  },

  getCertificationByVerificationCode(request) {
    const verificationCode = request.payload.verificationCode;

    return usecases.getShareableCertificate({ verificationCode })
      .then((certificate) => certificationSerializer.serializeForSharing(certificate));
  },

  async getPDFAttestation(request, h) {
    const userId = request.auth.credentials.userId;
    const certificationId = parseInt(request.params.id);
    const attestation = await usecases.getCertificationAttestation({
      userId,
      certificationId,
    });

    const { file, fileName } = await certificationAttestationPdf.getCertificationAttestationPdfBuffer({ certificate: attestation });

    return h.response(file)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  },

  async neutralizeChallenge(request, h) {
    const challengeRecId = request.payload.data.attributes.challengeRecId;
    const certificationCourseId = request.payload.data.attributes.certificationCourseId;
    const juryId = request.auth.credentials.userId;
    const event = await usecases.neutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await events.eventDispatcher.dispatch(event);
    return h.response().code(204);
  },

  async deneutralizeChallenge(request, h) {
    const challengeRecId = request.payload.data.attributes.challengeRecId;
    const certificationCourseId = request.payload.data.attributes.certificationCourseId;
    const juryId = request.auth.credentials.userId;
    const event = await usecases.deneutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await events.eventDispatcher.dispatch(event);
    return h.response().code(204);
  },
};
