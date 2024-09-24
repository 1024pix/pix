import lodash from 'lodash';

import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { serializeForParticipation } from '../infrastructure/serializers/candidate-serializer.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';
import { services } from './services/index.js';
const { trim } = lodash;

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
  const firstName = trim(request.payload.data.attributes['first-name']);
  const lastName = trim(request.payload.data.attributes['last-name']);
  const birthdate = request.payload.data.attributes['birthdate'];

  const candidate = await services.registerCandidateParticipation({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc: normalize,
  });

  return h.response(serializeForParticipation(candidate)).created();
};

const sessionController = {
  createSession,
  get,
  update,
  remove,
  createCandidateParticipation,
};
export { sessionController };
