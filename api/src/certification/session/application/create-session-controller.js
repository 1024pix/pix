import * as sessionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/session-serializer.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: newSession });
};

const createSessionController = {
  createSession,
};
export { createSessionController };
