const { featureToggles } = require('../../config');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

module.exports = {
  verify(request, h) {
    if (!featureToggles.godmode) {
      const buildedError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette fonctionnalité');
      return h.response(validationErrorSerializer.serialize(buildedError)).code(401).takeover();
    }

    return 'ok';
  },
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
