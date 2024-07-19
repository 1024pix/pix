import { usecases } from '../../domain/usecases/index.js';

const authorizeToResume = async function (request, h) {
  const certificationCandidateId = request.params.id;

  await usecases.authorizeCertificationCandidateToResume({
    certificationCandidateId,
  });

  return h.response().code(204);
};

const endAssessmentBySupervisor = async function (request) {
  const certificationCandidateId = request.params.id;

  await usecases.endAssessmentBySupervisor({ certificationCandidateId });

  return null;
};

const certificationCandidatesController = {
  authorizeToResume,
  endAssessmentBySupervisor,
};

export { certificationCandidatesController };
