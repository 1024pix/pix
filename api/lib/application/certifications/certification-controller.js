const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const { Deserializer } = require('jsonapi-serializer');

function _deserializePayload(payload) {
  const deserializer = new Deserializer({
    keyForAttribute: 'camelCase',
  });
  return deserializer.deserialize(payload);
}

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

  updateCertification(request) {

    return Promise.resolve(request.payload)
      .then(_deserializePayload)
      .then((payload) => {
        const isPublished = payload.isPublished;

        return usecases.updateCertificationPublicationStatus({
          certificationId: request.params.id,
          isPublished,
        });
      })
      .then((certification) => certificationSerializer.serialize(certification));
  },

  async analyzeAttendanceSheet(request) {
    const odsBuffer = request.payload.file;

    return usecases.analyzeAttendanceSheet({ odsBuffer });
  }
};
