import { usecases } from '../domain/usecases/index.js';
import { prescriberSerializer } from '../infrastructure/serializers/jsonapi/prescriber-serializer.js';

/**
 * @param request
 * @param h
 * @param dependencies
 * @return {Promise<*>}
 */
const get = async function (request, h, dependencies = { prescriberSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const prescriber = await usecases.getPrescriber({ userId: authenticatedUserId });
  return dependencies.prescriberSerializer.serialize(prescriber);
};

export const prescriberInformationsController = { get };
