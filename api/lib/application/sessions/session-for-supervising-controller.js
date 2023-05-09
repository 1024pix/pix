import { usecases } from '../../domain/usecases/index.js';
import * as sessionForSupervisingSerializer from '../../infrastructure/serializers/jsonapi/session-for-supervising-serializer.js';

const get = async function (request) {
  const sessionId = request.params.id;
  const session = await usecases.getSessionForSupervising({ sessionId });
  return sessionForSupervisingSerializer.serialize(session);
};

const supervise = async function (request, h) {
  const { 'supervisor-password': supervisorPassword, 'session-id': sessionId } = request.payload.data.attributes;
  const { userId } = request.auth.credentials;
  await usecases.superviseSession({ sessionId, userId, supervisorPassword });
  return h.response().code(204);
};

export { get, supervise };
