const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const { Deserializer } = require('jsonapi-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

function _deserializePayload(payload) {
  const deserializer = new Deserializer({
    keyForAttribute: 'camelCase',
  });
  return deserializer.deserialize(payload);
}

module.exports = {
  findUserCertifications(request, h) {
    const userId = request.auth.credentials.userId;

    return usecases.findCompletedUserCertifications({ userId })
      .then((certifications) => certificationSerializer.serialize(certifications))
      .catch((error) => errorManager.send(h, error));
  },

  getCertification(request, h) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;

    return usecases.getUserCertificationWithResultTree({
      userId,
      certificationId,
    })
      .then((certification) => certificationSerializer.serialize(certification))
      .catch((error) => errorManager.send(h, error));
  },

  updateCertification(request, h) {

    return Promise.resolve(request.payload)
      .then(_deserializePayload)
      .then((payload) => {
        return usecases.updateCertification({
          certificationId: request.params.id,
          attributesToUpdate: payload,
        });
      })
      .then((certification) => certificationSerializer.serialize(certification))
      .catch((error) => errorManager.send(h, error));
  },
};
