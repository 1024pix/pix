import { usecases } from '../domain/usecases/index.js';
import { sessionSerializer } from '../infrastructure/serializers/session-serializer.js';

async function createSession(request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize(newSession);
}

async function update(request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.sessionId;

  const updatedSession = await usecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize(updatedSession);
}

async function remove(request, h) {
  const sessionId = request.params.sessionId;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
}

async function get(request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.sessionId;
  const session = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize(session);
}

export const sessionController = {
  createSession,
  get,
  update,
  remove,
};
