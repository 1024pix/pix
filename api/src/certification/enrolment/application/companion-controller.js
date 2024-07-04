import { usecases } from '../domain/usecases/index.js';

const savePing = async function (request, h) {
  const { userId } = request.auth.credentials;
  await usecases.saveCompanionPing({ userId });
  return h.response().code(204);
};

export const companionController = {
  savePing,
};
