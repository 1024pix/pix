import * as sessionSerializer from '../infrastructure/serializers/jsonapi/session-serializer.js';
import { usecases } from '../../shared/domain/usecases/index.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: newSession });
};

const sessionController = {
  createSession,
};
export { sessionController };
