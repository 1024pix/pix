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
    const certificationId = request.params.id;

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
        return usecases.updateCertification({
          certificationId: request.params.id,
          attributesToUpdate: payload,
        });
      })
      .then((certification) => certificationSerializer.serialize(certification));
  },
};
