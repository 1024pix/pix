import { usecases } from '../domain/usecases/index.js';

async function supervise(request, h) {
  const { 'invigilator-password': invigilatorPassword, 'session-id': sessionId } = request.payload.data.attributes;
  const { userId } = request.auth.credentials;
  await usecases.superviseSession({ sessionId, userId, invigilatorPassword });
  return h.response().code(204);
}

export const superviseController = { supervise };
