import { usecases } from '../domain/usecases/index.js';
import * as sessionForSupervisingSerializer from '../infrastructure/serializers/session-for-supervising-serializer.js';

const get = async function (request) {
  const sessionId = request.params.id;
  const session = await usecases.getSessionForSupervising({ sessionId });
  return sessionForSupervisingSerializer.serialize(session);
};

const sessionForSupervisingController = { get };

export { sessionForSupervisingController };
