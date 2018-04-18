const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');

module.exports = {
  findUserCertifications(request, reply) {
    const userId = request.auth.credentials.userId;
    return usecases.findCompletedUserCertifications({userId})
      .then(certifications => {
        reply(certificationSerializer.serializeCertification(certifications)).code(200);
      });
  }
}
