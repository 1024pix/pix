import { usecases } from '../domain/usecases/index.js';

const supervise = async function (request, h) {
  const { 'supervisor-password': invigilatorPassword, 'session-id': sessionId } = request.payload.data.attributes;
  const { userId } = request.auth.credentials;
  await usecases.superviseSession({ sessionId, userId, invigilatorPassword });
  return h.response().code(204);
};

const superviseController = { supervise };

export { superviseController };
