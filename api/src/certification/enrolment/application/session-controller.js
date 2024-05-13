import { usecases } from '../domain/usecases/index.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize(newSession);
};

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.id;

  const updatedSession = await usecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize(updatedSession);
};

const remove = async function (request, h) {
  const sessionId = request.params.id;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const get = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const session = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize(session);
};

const sessionController = {
  createSession,
  get,
  update,
  remove,
};
export { sessionController };
