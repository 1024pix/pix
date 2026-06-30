import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { V3CertificationScoring } from '../../domain/models/V3CertificationScoring.js';

export const getLatestByDateAndLocale = async ({ locale, date }) => {
  const certificationVersion = await versionApi.getByFrameworkAndDate({ date, framework: Frameworks.CORE });

  if (
    !certificationVersion ||
    !certificationVersion.competencesScoringConfiguration ||
    !certificationVersion.globalScoringConfiguration ||
    !certificationVersion.minimumAnswersRequiredToValidateACertification
  ) {
    throw new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`);
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
};

export const getLatestByVersion = async ({ version }) => {
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
};
