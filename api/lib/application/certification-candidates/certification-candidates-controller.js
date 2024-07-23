import { usecases } from '../../domain/usecases/index.js';

const endAssessmentBySupervisor = async function (request) {
  const certificationCandidateId = request.params.id;

  await usecases.endAssessmentBySupervisor({ certificationCandidateId });

  return null;
};

const certificationCandidatesController = {
  endAssessmentBySupervisor,
};

export { certificationCandidatesController };
