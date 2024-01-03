import { usecases } from '../../shared/domain/usecases/index.js';

export const unfinalizeSession = async function (request, h) {
  const sessionId = request.params.id;
  await usecases.unfinalizeSession({ sessionId });

  return h.response().code(204);
};

const sessionUnfinalizeController = {
  unfinalizeSession,
};

export { sessionUnfinalizeController };
