import { usecases } from '../domain/usecases/index.js';
import * as supervisedCandidateRepository from '../infrastructure/repositories/supervised-candidate-repository.js';

async function authorizeToStart(request, h, dependencies = { supervisedCandidateRepository }) {
  const certificationCandidateForSupervisingId = request.params.certificationCandidateId;
  const authorizedToStart = request.payload['authorized-to-start'];

  if (authorizedToStart) {
    await dependencies.supervisedCandidateRepository.authorizeToStart(certificationCandidateForSupervisingId);
  } else {
    await dependencies.supervisedCandidateRepository.unauthorizeToStart(certificationCandidateForSupervisingId);
  }

  return h.response().code(204);
}

async function authorizeToResume(request, h, dependencies = { supervisedCandidateRepository }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await dependencies.supervisedCandidateRepository.authorizeToStart(certificationCandidateId);

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
