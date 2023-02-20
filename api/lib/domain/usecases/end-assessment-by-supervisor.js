export default async function endAssessmentBySupervisor({ certificationCandidateId, assessmentRepository }) {
  const assessment = await assessmentRepository.getByCertificationCandidateId(certificationCandidateId);

  if (assessment.isCompleted()) {
    return;
  }

  await assessmentRepository.endBySupervisorByAssessmentId(assessment.id);
}
