import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as sessionRepository from '../infrastructure/repositories/session-repository.js';
import { candidateSerializer } from '../infrastructure/serializers/candidate-serializer.js';
import { sessionSerializer } from '../infrastructure/serializers/session-serializer.js';

async function createSession(request, h, dependencies = { sessionSerializer, sessionRepository }) {
  const userId = request.auth.credentials.userId;
  const certificationCenterId = request.params.certificationCenterId;
  const { address, room, date, time, examiner, description } = request.payload.data.attributes;

  const newSessionId = await usecases.createSession({
    userId,
    certificationCenterId,
    address,
    room,
    date,
    time,
    examiner,
    description,
  });

  const session = await dependencies.sessionRepository.get({ id: newSessionId });

  return dependencies.sessionSerializer.serialize(session);
}

async function update(request, h, dependencies = { sessionSerializer, sessionRepository }) {
  const { address, room, date, time, examiner, description } = request.payload.data.attributes;
  const sessionId = request.params.sessionId;

  await usecases.updateSession({ address, room, date, time, examiner, description, sessionId });
  const updatedSession = await dependencies.sessionRepository.get({ id: sessionId });

  if (!updatedSession) {
    return h.response().code(404);
  }

  return dependencies.sessionSerializer.serialize(updatedSession);
}

async function remove(request, h) {
  const sessionId = request.params.sessionId;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
}

async function get(request, h, dependencies = { sessionSerializer, sessionRepository }) {
  const sessionId = request.params.sessionId;
  const session = await dependencies.sessionRepository.get({ id: sessionId });

  if (!session) {
    return h.response().code(404);
  }

  return dependencies.sessionSerializer.serialize(session);
}

async function createCandidateParticipation(request, h) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.sessionId;
  const firstName = request.payload.data.attributes['first-name'].trim();
  const lastName = request.payload.data.attributes['last-name'].trim();
  const birthdate = request.payload.data.attributes['birthdate'];

  const origin = request.headers.origin || request.headers.referer;
  const isFrenchDomainExtension = origin ? new URL(origin).hostname.endsWith('.fr') : false;

  const candidate = await usecases.registerCandidateParticipation({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    isFrenchDomainExtension,
    normalizeStringFnc: normalize,
  });

  return h.response(candidateSerializer.serializeForParticipation(candidate)).created();
}

const sessionController = {
  createSession,
  get,
  update,
  remove,
  createCandidateParticipation,
};
export { sessionController };
