import * as sessionForSupervisingRepository from '../infrastructure/repositories/session-for-supervising-repository.js';
import * as sessionForSupervisingSerializer from '../infrastructure/serializers/session-for-supervising-serializer.js';

async function get(request, _, dependencies = { sessionForSupervisingRepository }) {
  const sessionId = request.params.sessionId;

  const sessionForSupervising = await dependencies.sessionForSupervisingRepository.get({ id: sessionId });
  return sessionForSupervisingSerializer.serialize(sessionForSupervising);
}

const sessionForSupervisingController = { get };

export { sessionForSupervisingController };
