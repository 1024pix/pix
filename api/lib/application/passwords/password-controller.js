import * as userSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import * as passwordResetSerializer from '../../infrastructure/serializers/jsonapi/password-reset-serializer.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const createResetDemand = async function (
  request,
  h,
  dependencies = {
    passwordResetSerializer,
  },
) {
  const { email } = request.payload.data.attributes;
  const locale = extractLocaleFromRequest(request);

  const passwordResetDemand = await usecases.createPasswordResetDemand({
    email,
    locale,
  });
  const serializedPayload = dependencies.passwordResetSerializer.serialize(passwordResetDemand.attributes);

  return h.response(serializedPayload).created();
};

const checkResetDemand = async function (request, h, dependencies = { userSerializer }) {
  const temporaryKey = request.params.temporaryKey;
  const user = await usecases.getUserByResetPasswordDemand({ temporaryKey });
  return dependencies.userSerializer.serialize(user);
};

const updateExpiredPassword = async function (request, h) {
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
};

const passwordController = { createResetDemand, checkResetDemand, updateExpiredPassword };

export { passwordController };
