import * as userSerializer from '../../../shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as resetPasswordSerializer from '../../infrastructure/serializers/jsonapi/reset-password.serializer.js';

const checkResetDemand = async function (request, h, dependencies = { userSerializer }) {
  const temporaryKey = request.params.temporaryKey;
  const user = await usecases.getUserByResetPasswordDemand({ temporaryKey });
  return dependencies.userSerializer.serialize(user);
};
const createResetPasswordDemand = async function (request, h, dependencies = { resetPasswordSerializer }) {
  const { email } = request.payload.data.attributes;
  const locale = extractLocaleFromRequest(request);

  const resetPasswordDemand = await usecases.createResetPasswordDemand({
    email,
    locale,
  });
  const serializedPayload = dependencies.resetPasswordSerializer.serialize(resetPasswordDemand);

  return h.response(serializedPayload).created();
};

export const passwordController = { checkResetDemand, createResetPasswordDemand };
