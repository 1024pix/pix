/**
 * @param {object} params
 * @param {number} params.assessmentId
 * @param {import('./index.js').CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {import('./index.js').CertificationCompanionAlertRepository} params.certificationCompanionAlertRepository
 *
 * @returns {Promise<{challengeLiveAlerts: Array<object>, companionLiveAlerts: Array<object>}>}
 */
export async function getAssessmentLiveAlerts({
  assessmentId,
  certificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository,
}) {
  const challengeLiveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId({ assessmentId });
  const companionLiveAlerts = await certificationCompanionAlertRepository.getAllByAssessmentId({ assessmentId });

  return { challengeLiveAlerts, companionLiveAlerts };
}
