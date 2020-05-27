const usecases = require('../../domain/usecases');

const mailService = require('../../domain/services/mail-service');
const resetPasswordService = require('../../domain/services/reset-password-service');
const tokenService = require('../../domain/services/token-service');

const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async createResetDemand(request, h) {
    const user = userSerializer.deserialize(request.payload);
    await userRepository.isUserExistingByEmail(user.email);
    const temporaryKey = resetPasswordService.generateTemporaryKey();
    const passwordResetDemand = await resetPasswordDemandRepository.create({ email: user.email, temporaryKey });
    const locale = extractLocaleFromRequest(request);
    await mailService.sendResetPasswordDemandEmail(user.email, locale, temporaryKey);
    const serializedPayload = passwordResetSerializer.serialize(passwordResetDemand.attributes);

    return h.response(serializedPayload).created();
  },

  async checkResetDemand(request) {
    const temporaryKey = request.params.temporaryKey;
    await tokenService.verifyValidity(temporaryKey);
    const passwordResetDemand = await resetPasswordService.verifyDemand(temporaryKey);
    const user = await userRepository.findByEmail(passwordResetDemand.email);

    return userSerializer.serialize(user);
  },

  async updateExpiredPassword(request, h) {
    const { username, expiredPassword, newPassword } = request.payload.data.attributes;
    await usecases.updateExpiredPassword({ username, expiredPassword, newPassword });

    return h.response({ data: { type: 'users' } }).created();
  }
};
