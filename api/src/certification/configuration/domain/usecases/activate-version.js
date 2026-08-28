import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { CoreVersionRequiresScoringError, VersionNotDraftError } from '../errors.js';

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

  if (!draftVersion) throw new NotFoundError(`No certification version found for id: ${id}`);

  if (!draftVersion.isDraft) throw new VersionNotDraftError();

  if (
    draftVersion.scope === SCOPES.CORE &&
    (!draftVersion.globalScoringConfiguration?.length || !draftVersion.competencesScoringConfiguration?.length)
  ) {
    throw new CoreVersionRequiresScoringError();
  }

  const calibration = await calibrationRepository.find(draftVersion.externalCalibrationId);
  if (!calibration) {
    throw new NotFoundError(`No certification version found for id: ${draftVersion.externalCalibrationId}`);
  }
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
