import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ScoreCertificationJob } from '../models/ScoreCertificationJob.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {Array} params.globalScoringConfiguration
 * @param {Array|null} params.competencesScoringConfiguration
 * @param {object} params.versionRepository
 * @param {object} params.certificationCoursesToScoreRepository
 * @param {object} params.scoreCertificationJobRepository
 */
export async function saveScoringConfiguration({
  id,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  versionRepository,
  certificationCoursesToScoreRepository,
  scoreCertificationJobRepository,
}) {
  const version = await versionRepository.getById({ id });

  if (!version) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  await versionRepository.updateScoring({ id, globalScoringConfiguration, competencesScoringConfiguration });

  const certificationCourseIds = await certificationCoursesToScoreRepository.findIdsByVersionId({ versionId: id });
  await scoreCertificationJobRepository.performAsync(
    ...certificationCourseIds.map((certificationCourseId) => new ScoreCertificationJob({ certificationCourseId })),
  );
}
