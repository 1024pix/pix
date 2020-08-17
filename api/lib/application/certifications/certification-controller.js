const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');

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
    const pixScore = request.payload.data.pixScore;
    const verificationCode = request.payload.data.verificationCode;

    return usecases.getShareableCertificate({ pixScore, verificationCode })
      .then((certificate) => certificationSerializer.serializeForSharing(certificate));
  }
};
