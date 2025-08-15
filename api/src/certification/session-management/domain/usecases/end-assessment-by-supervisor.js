import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';

const endAssessmentBySupervisor = async function(
  { certificationCandidateId, certificationAssessmentRepository = injectedCertificationAssessmentRepository } = {},
) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCandidateId({
    certificationCandidateId,
  });

  if (certificationAssessment.isCompleted()) {
    return;
  }

  certificationAssessment.endBySupervisor({ now: new Date() });
  await certificationAssessmentRepository.save(certificationAssessment);
};

export { endAssessmentBySupervisor };
