const usecases = require('../../domain/usecases/index.js');

const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async createResetDemand(request, h) {
    const { email } = request.payload.data.attributes;
    const locale = extractLocaleFromRequest(request);

    const passwordResetDemand = await usecases.createPasswordResetDemand({
      email,
      locale,
    });
    const serializedPayload = passwordResetSerializer.serialize(passwordResetDemand.attributes);

    return h.response(serializedPayload).created();
  },

  async checkResetDemand(request) {
    const temporaryKey = request.params.temporaryKey;
    const user = await usecases.getUserByResetPasswordDemand({ temporaryKey });
    return userSerializer.serialize(user);
  },

  async updateExpiredPassword(request, h) {
    const passwordResetToken = request.payload.data.attributes['password-reset-token'];
    const newPassword = request.payload.data.attributes['new-password'];
    const login = await usecases.updateExpiredPassword({ passwordResetToken, newPassword });

    return h
      .response({
        data: {
          type: 'reset-expired-password-demands',
          attributes: {
            login,
          },
        },
      })
      .created();
  },
};
