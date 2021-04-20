const usecases = require('../../domain/usecases');
const privateCertificateSerializer = require('../../infrastructure/serializers/jsonapi/private-certificate-serializer');
const shareableCertificateSerializer = require('../../infrastructure/serializers/jsonapi/shareable-certificate-serializer');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');

module.exports = {
  findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    return usecases.findCompletedPrivateCertificates({ userId })
      .then((privateCertificates) => privateCertificateSerializer.serialize(privateCertificates));
  },

  getCertification(request) {
    const userId = request.auth.credentials.userId;
    const certificationId = parseInt(request.params.id);

    return usecases.getPrivateCertificate({
      userId,
      certificationId,
    })
      .then((certification) => privateCertificateSerializer.serialize(certification));
  },

  getCertificationByVerificationCode(request) {
    const verificationCode = request.payload.verificationCode;

    return usecases.getShareableCertificate({ verificationCode })
      .then((certificate) => shareableCertificateSerializer.serialize(certificate));
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
