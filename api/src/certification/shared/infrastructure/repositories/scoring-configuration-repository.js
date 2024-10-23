import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { V3CertificationScoring } from '../../domain/models/V3CertificationScoring.js';

export const getLatestByDateAndLocale = async ({ locale, date }) => {
  const allAreas = await areaRepository.list();
  const competenceList = await competenceRepository.list({ locale });

  const competenceScoringConfiguration = await knex('competence-scoring-configurations')
    .select('configuration')
    .where('createdAt', '<=', date)
    .orderBy('createdAt', 'desc')
    .first();

  if (!competenceScoringConfiguration) {
    throw new NotFoundError(`No competence scoring configuration found for date ${date.toISOString()}`);
  }

  const certificationScoringConfiguration = await knex('certification-scoring-configurations')
    .select('configuration')
    .where('createdAt', '<=', date)
    .orderBy('createdAt', 'desc')
    .first();

  if (!certificationScoringConfiguration) {
    throw new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`);
  }

  return V3CertificationScoring.fromConfigurations({
    competenceForScoringConfiguration: competenceScoringConfiguration.configuration,
    certificationScoringConfiguration: certificationScoringConfiguration.configuration,
    allAreas,
    competenceList,
  });
};

export const saveCompetenceForScoringConfiguration = async ({ configuration, userId }) => {
  const data = {
    configuration: JSON.stringify(configuration),
    createdByUserId: userId,
  };
  await knex('competence-scoring-configurations').insert(data);
};

export const saveCertificationScoringConfiguration = async ({ configuration, userId }) => {
  const data = {
    configuration: JSON.stringify(configuration),
    createdByUserId: userId,
  };
  await knex('certification-scoring-configurations').insert(data);
};
