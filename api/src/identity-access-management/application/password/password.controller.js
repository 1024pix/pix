import { getUserLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { userSerializer } from '../../infrastructure/serializers/jsonapi/user-serializer.js';

const createResetPasswordDemand = async function (request, h) {
  const email = request.payload.email;
  const locale = getUserLocale(request);

  await usecases.createResetPasswordDemand({ email, locale });

  return h.response().code(204);
};

const checkResetDemand = async function (request) {
  const temporaryKey = request.payload['temporary-key'];

  const user = await usecases.getUserByResetPasswordDemand({ temporaryKey });
  return userSerializer.serialize(user);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const updatePassword = async function (request, h) {
  const temporaryKey = request.payload['temporary-key'];
  const password = request.payload.password;

  await usecases.updateUserPassword({ temporaryKey, password });

  return h.response().code(204);
};

const updateExpiredPassword = async function (request, h) {
  const passwordExpirationToken = request.payload.data.attributes['password-reset-token'];
  const newPassword = request.payload.data.attributes['new-password'];
  const login = await usecases.updateExpiredPassword({ passwordExpirationToken, newPassword });

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
};

export const passwordController = {
  createResetPasswordDemand,
  checkResetDemand,
  updatePassword,
  updateExpiredPassword,
};
