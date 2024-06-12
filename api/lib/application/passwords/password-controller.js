import * as userSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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

const passwordController = { checkResetDemand, updateExpiredPassword };

export { passwordController };
