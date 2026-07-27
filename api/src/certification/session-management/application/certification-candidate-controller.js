import { usecases } from '../domain/usecases/index.js';
import * as eventAdapter from '../infrastructure/adapters/event-adapter.js';
import * as supervisedCandidateRepository from '../infrastructure/repositories/supervised-candidate-repository.js';

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

const certificationCandidateController = {
  authorizeToStart,
  authorizeToResume,
  endAssessmentByInvigilator,
};
export { certificationCandidateController };
