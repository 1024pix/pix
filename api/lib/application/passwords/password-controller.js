const usecases = require('../../domain/usecases');
const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const passwordResetDemandSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-demand-serializer');

module.exports = {
  createPasswordResetDemand(request, h) {
    const { email } = request.payload.data.attributes;

    return usecases.createPasswordResetDemand({ email })
      .then((passwordResetDemand) => passwordResetDemandSerializer.serialize(passwordResetDemand.attributes))
      .then((serializedPayload) => h.response(serializedPayload).created());
  },

  createPasswordReset(request, h) {
    const { attributes } = request.payload.data;
    const { password } = attributes;
    const temporaryKey = attributes['temporary-key'];

    return usecases.resetPassword({ temporaryKey, password })
      .then(() => passwordResetSerializer.serialize({ password, temporaryKey }))
      .then((serializedPayload) => h.response(serializedPayload).created());
  },
};
