import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { V3CertificationScoring } from '../../domain/models/V3CertificationScoring.js';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {Date} params.date
 * @returns {Promise<V3CertificationScoring|null>} the scoring configuration, or null when no fully
 * configured certification version applies at that date
 */
export async function getLatestByDateAndLocale({ locale, date }) {
  const certificationVersion = await versionApi.getByFrameworkAndDate({ date, framework: Frameworks.CORE });

  if (
    !certificationVersion ||
    !certificationVersion.competencesScoringConfiguration ||
    !certificationVersion.globalScoringConfiguration ||
    !certificationVersion.minimumAnswersRequiredToValidateACertification
  ) {
    return null;
  }

  const allAreas = await areaRepository.list();
  // NOTE : only works for certification of core competencies
  const competenceList = await competenceRepository.listPixCompetencesOnly({ locale });

  return V3CertificationScoring.fromConfigurations({
    competenceForScoringConfiguration: certificationVersion.competencesScoringConfiguration,
    certificationScoringConfiguration: certificationVersion.globalScoringConfiguration,
    allAreas,
    competenceList,
    minimumAnswersRequiredToValidateACertification: certificationVersion.minimumAnswersRequiredToValidateACertification,
    versionId: certificationVersion.id,
  });
}

export async function getLatestByVersion({ version }) {
  const allAreas = await areaRepository.list();
  const competenceList = await competenceRepository.list();

  return V3CertificationScoring.fromConfigurations({
    competenceForScoringConfiguration: version.competencesScoringConfiguration,
    certificationScoringConfiguration: version.globalScoringConfiguration,
    allAreas,
    competenceList,
    minimumAnswersRequiredToValidateACertification: version.minimumAnswersRequiredToValidateACertification,
    versionId: version.id,
  });
}
