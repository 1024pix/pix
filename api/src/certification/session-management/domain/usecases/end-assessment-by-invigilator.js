export async function endAssessmentByInvigilator({ certificationCandidateId, certificationAssessmentRepository }) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCandidateId({
    certificationCandidateId,
  });

  if (certificationAssessment.isCompleted()) {
    return;
  }

  certificationAssessment.endByInvigilator();
  await certificationAssessmentRepository.save(certificationAssessment);
}
