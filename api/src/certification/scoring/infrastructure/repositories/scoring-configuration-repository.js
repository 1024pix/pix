import { knex } from '../../../../../db/knex-database-connection.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { V3CertificationScoring } from '../../domain/models/V3CertificationScoring.js';

export const getLatestByDateAndLocale = async ({ locale, date }) => {
  const allAreas = await areaRepository.list();
  const competenceList = await competenceRepository.list({ locale });

  const { configuration: competenceForScoringConfiguration } = await knex('competence-scoring-configurations')
    .select('configuration')
    .where('createdAt', '<=', date)
    .orderBy('createdAt', 'desc')
    .first();

  const { configuration: certificationScoringConfiguration } = await knex('certification-scoring-configurations')
    .select('configuration')
    .where('createdAt', '<=', date)
    .orderBy('createdAt', 'desc')
    .first();

  return V3CertificationScoring.fromConfigurations({
    competenceForScoringConfiguration,
    certificationScoringConfiguration,
    allAreas,
    competenceList,
  });
};

export const saveCompetenceForScoringConfiguration = async (configuration) => {
  const data = {
    configuration: JSON.stringify(configuration),
  };
  await knex('competence-scoring-configurations').insert(data);
};

export const saveCertificationScoringConfiguration = async (configuration) => {
  const data = {
    configuration: JSON.stringify(configuration),
  };
  await knex('certification-scoring-configurations').insert(data);
};
