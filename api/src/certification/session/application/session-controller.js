import * as sessionSerializer from '../infrastructure/serializers/jsonapi/session-serializer.js';
import { usecases } from '../../shared/domain/usecases/index.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: newSession });
};

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.id;

  const updatedSession = await usecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: updatedSession });
};

const remove = async function (request, h) {
  const sessionId = request.params.id;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const sessionController = {
  createSession,
  update,
  remove,
};
export { sessionController };
