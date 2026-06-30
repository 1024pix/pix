import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { candidateSerializer } from '../infrastructure/serializers/candidate-serializer.js';
import { sessionSerializer } from '../infrastructure/serializers/session-serializer.js';
import { services } from './services/index.js';

const createSession = async function (request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await usecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize(newSession);
};

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.sessionId;

  const updatedSession = await usecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize(updatedSession);
};

const remove = async function (request, h) {
  const sessionId = request.params.sessionId;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const get = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.sessionId;
  const session = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize(session);
};

const createCandidateParticipation = async function (request, h) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.sessionId;
  const firstName = request.payload.data.attributes['first-name'].trim();
  const lastName = request.payload.data.attributes['last-name'].trim();
  const birthdate = request.payload.data.attributes['birthdate'];

  const origin = request.headers.origin || request.headers.referer;
  const isFrenchDomainExtension = origin ? new URL(origin).hostname.endsWith('.fr') : false;

  const candidate = await services.registerCandidateParticipation({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    isFrenchDomainExtension,
    normalizeStringFnc: normalize,
  });

  return h.response(candidateSerializer.serializeForParticipation(candidate)).created();
};

const sessionController = {
  createSession,
  get,
  update,
  remove,
  createCandidateParticipation,
};
export { sessionController };
