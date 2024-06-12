import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as resetPasswordSerializer from '../../infrastructure/serializers/jsonapi/reset-password.serializer.js';

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

export const passwordController = { createResetPasswordDemand };
