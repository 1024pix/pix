import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import { CompetenceForScoring } from '../../domain/models/CompetenceForScoring.js';
import { knex } from '../../../../../db/knex-database-connection.js';

export const listByLocale = async ({ locale }) => {
  const allAreas = await areaRepository.list();
  const competenceList = await competenceRepository.list({ locale });

  const competenceScoringConfiguration = await knex('competence-scoring-configurations')
    .select('configuration')
    .orderBy('createdAt', 'desc')
    .first();

  return competenceScoringConfiguration.configuration.map(({ competence: competenceCode, values }) => {
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

export const save = async (configuration) => {
  const data = {
    configuration: JSON.stringify(configuration),
  };
  await knex('competence-scoring-configurations').insert(data);
};
