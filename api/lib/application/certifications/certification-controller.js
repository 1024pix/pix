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

    return usecases.getUserCertificationWithResultTree({
      userId,
      certificationId,
    })
      .then((certification) => certificationSerializer.serialize(certification));
  },
};
