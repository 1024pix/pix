import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as eventAdapter from '../infrastructure/adapters/event-adapter.js';
import * as supervisedCandidateRepository from '../infrastructure/repositories/supervised-candidate-repository.js';
import { serializeForParticipation } from '../infrastructure/serializers/candidate-serializer.js';

async function authorizeToStart(request, h, dependencies = { supervisedCandidateRepository, eventAdapter }) {
  const candidateId = request.params.certificationCandidateId;
  const authorizedToStart = request.payload['authorized-to-start'];

  if (authorizedToStart) {
    const authorizedToStartAt = await dependencies.supervisedCandidateRepository.authorizeToStart(candidateId);
    await dependencies.eventAdapter.onCandidateAuthorizedToStart({ candidateId, authorizedToStartAt });
  } else {
    await dependencies.supervisedCandidateRepository.unauthorizeToStart(candidateId);
    await dependencies.eventAdapter.onCandidateUnauthorizedToStart({ candidateId });
  }

  return h.response().code(204);
}

async function authorizeToResume(request, h, dependencies = { supervisedCandidateRepository, eventAdapter }) {
  const candidateId = request.params.certificationCandidateId;

  const authorizedToStartAt = await dependencies.supervisedCandidateRepository.authorizeToStart(candidateId);
  await dependencies.eventAdapter.onCandidateAuthorizedToResume({ candidateId, authorizedToStartAt });

  return h.response().code(204);
}

async function endAssessmentByInvigilator(request) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await usecases.endAssessmentByInvigilator({ certificationCandidateId });

  return null;
}

async function createCandidateParticipation(request, h) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.sessionId;
  const firstName = request.payload.data.attributes['first-name'].trim();
  const lastName = request.payload.data.attributes['last-name'].trim();
  const birthdate = request.payload.data.attributes['birthdate'];

  const origin = request.headers.origin || request.headers.referer;
  const isFrenchDomainExtension = origin ? new URL(origin).hostname.endsWith('.fr') : false;

  console.log('la ?');
  console.log({userId})
  const candidate = await usecases.registerCandidateParticipation({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    isFrenchDomainExtension,
    normalizeStringFnc: normalize,
  });

  console.log('lab ?');
  return h.response(serializeForParticipation(candidate)).created();
}

export const certificationCandidateController = {
  authorizeToStart,
  authorizeToResume,
  endAssessmentByInvigilator,
  createCandidateParticipation,
};
