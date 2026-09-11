import { usecases } from '../domain/usecases/index.js';

export async function unfinalizeSession(request, h) {
  const sessionId = request.params.sessionId;
  await usecases.unfinalizeSession({ sessionId });

  return h.response().code(204);
}

export const unfinalizeController = {
  unfinalizeSession,
};
