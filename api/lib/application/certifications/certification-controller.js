const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');

module.exports = {
  findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    return usecases.findCompletedUserCertifications({ userId })
      .then((certifications) => certificationSerializer.serialize(certifications));
  },

  getCertification(request) {
    const userId = request.auth.credentials.userId;
    const certificationId = parseInt(request.params.id);

    return usecases.getPrivateCertificate({
      userId,
      certificationId,
    })
      .then((certification) => certificationSerializer.serialize(certification));
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
};
