import { usecases as sessionUsecases } from '../../session/domain/usecases/index.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await sessionUsecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: newSession });
};

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.id;

  const updatedSession = await sessionUsecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: updatedSession });
};

const remove = async function (request, h) {
  const sessionId = request.params.id;

  await sessionUsecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const sessionController = {
  createSession,
  update,
  remove,
};
export { sessionController };
