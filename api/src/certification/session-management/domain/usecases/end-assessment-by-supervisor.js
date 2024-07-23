const endAssessmentBySupervisor = async function ({ certificationCandidateId, certificationAssessmentRepository }) {
  const certificationAssessment =
    await certificationAssessmentRepository.getByCertificationCandidateId(certificationCandidateId);

  if (certificationAssessment.isCompleted()) {
    return;
  }

  certificationAssessment.endBySupervisor({ now: new Date() });
  await certificationAssessmentRepository.save(certificationAssessment);
};

export { endAssessmentBySupervisor };
