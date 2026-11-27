export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  eduV3ExternalJuryResult,
  juryCertificationRepository,
  certificationResultAdapter,
}) {
  const juryCertification = await juryCertificationRepository.get({ certificationCourseId });
  juryCertification.updateEduV3ExternalJuryResult(eduV3ExternalJuryResult);

  await juryCertificationRepository.update(juryCertification);
  await certificationResultAdapter.updateEduV3ExternalJuryResult({ certificationCourseId, eduV3ExternalJuryResult });

  return juryCertification;
}
