import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as areaRepository from '../../../../../lib/infrastructure/repositories/area-repository.js';
import { competenceLevelIntervals } from '../../../flash-certification/domain/constants/competence-level-intervals.js';
import { CompetenceForScoring } from '../../domain/models/CompetenceForScoring.js';

export const listByLocale = async ({ locale }) => {
  const allAreas = await areaRepository.list();
  const competenceList = await competenceRepository.list({ locale });

  return competenceLevelIntervals.map(({ competence: competenceCode, values }) => {
    const competence = competenceList.find(({ index: code }) => code === competenceCode);
    const area = allAreas.find((area) => area.id === competence.areaId);
    return new CompetenceForScoring({
      competenceId: competence.id,
      areaCode: area.code,
      competenceCode,
      intervals: values,
    });
  });
};
