import { VersionNotDraftError } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.id - ID de la version DRAFT à activer
 * @param {object} params.versionRepository
 * @param {object} params.calibrationRepository
 * @param {object} params.calibratedChallengesRepository
 */
export async function activateVersion({
  id,
  versionRepository,
  calibrationRepository,
  calibratedChallengesRepository,
}) {
  const draftVersion = await versionRepository.getById({ id });

  if (!draftVersion) throw new VersionNotDraftError();
  if (!draftVersion.isDraft) throw new VersionNotDraftError();

  const calibration = await calibrationRepository.find(draftVersion.externalCalibrationId);
  await calibratedChallengesRepository.saveMany({
    calibratedChallenges: calibration.calibratedChallenges,
    versionId: draftVersion.id,
  });

  const now = new Date();

  const activeVersion = await versionRepository.findActiveByScope({ scope: draftVersion.scope });
  if (activeVersion) {
    activeVersion.archive(now);
    await versionRepository.save(activeVersion);
  }

  draftVersion.activate(now);
  await versionRepository.save(draftVersion);
}
