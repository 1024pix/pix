import { usecases } from '../domain/usecases/index.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';

const get = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const { session, hasSupervisorAccess, hasSomeCleaAcquired } = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize({ session, hasSupervisorAccess, hasSomeCleaAcquired });
};

const sessionController = {
  get,
};

export { sessionController };
