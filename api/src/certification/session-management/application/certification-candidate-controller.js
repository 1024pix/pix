import { usecases } from '../domain/usecases/index.js';

const authorizeToStart = async function (request, h) {
  const certificationCandidateForSupervisingId = request.params.id;

  const authorizedToStart = request.payload['authorized-to-start'];
  await usecases.authorizeCertificationCandidateToStart({
    certificationCandidateForSupervisingId,
    authorizedToStart,
  });

  return h.response().code(204);
};

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

const certificationCandidateController = {
  authorizeToStart,
  authorizeToResume,
  endAssessmentBySupervisor,
};
export { certificationCandidateController };
