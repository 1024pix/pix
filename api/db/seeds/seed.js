import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { DatabaseBuilder } from '../database-builder/database-builder.js';
import { commonBuilder } from './data/common/common-builder.js';
import { complementaryCertificationBuilder } from './data/common/complementary-certification-builder.js';
import { featuresBuilder } from './data/common/feature-builder.js';
import { organizationBuilder } from './data/common/organization-builder.js';
import { organizationLearnerImportFormat } from './data/common/organization-learner-import-formats.js';
import { tagsBuilder } from './data/common/tag-builder.js';
import { team1dDataBuilder } from './data/team-1d/data-builder.js';
import { teamAccesDataBuilder } from './data/team-acces/data-builder.js';
import { teamCertificationDataBuilder } from './data/team-certification/data-builder.js';
import { teamContenuDataBuilder } from './data/team-contenu/data-builder.js';
import { teamDevcompDataBuilder } from './data/team-devcomp/data-builder.js';
import { teamEvaluationDataBuilder } from './data/team-evaluation/data-builder.js';
import { teamPrescriptionDataBuilder } from './data/team-prescription/data-builder.js';

const seed = async function (knex) {
  logger.info('START Seeding');
  const seedsContext = process.env.SEEDS_CONTEXT ? process.env.SEEDS_CONTEXT.split('|') : [];

  const hasToSeed = _buildContextToSeed(seedsContext);
  logger.info({ seedsContext }, 'Seeds Context');

  const databaseBuilder = new DatabaseBuilder({ knex });

  // Common
  await commonBuilder({ databaseBuilder });
  await tagsBuilder({ databaseBuilder });

  // FEATURES
  // This is needed when you have to re-seed database that is fully migrated (ex: on Scalingo you can't drop database)
  await featuresBuilder({ databaseBuilder });
  await organizationLearnerImportFormat({ databaseBuilder });

  // ORGANIZATION
  await organizationBuilder({ databaseBuilder });

  // SCOPE
  if (hasToSeed.prescription) {
    logger.info('Seeding : Prescription');
    await teamPrescriptionDataBuilder({ databaseBuilder });
  }

  if (hasToSeed.devcomp) {
    logger.info('Seeding : Devcomp');
    await teamDevcompDataBuilder({ databaseBuilder });
  }

  if (hasToSeed.acces) {
    logger.info('Seeding : Acces');
    await teamAccesDataBuilder(databaseBuilder);
  }

  if (hasToSeed.junior) {
    logger.info('Seeding : Junior');
    await team1dDataBuilder(databaseBuilder);
  }

  if (hasToSeed.content) {
    logger.info('Seeding : Contenu');
    await teamContenuDataBuilder({ databaseBuilder });
  }

  if (hasToSeed.certification) {
    logger.info('Seeding : Certification');
    await complementaryCertificationBuilder({ databaseBuilder });
    await teamCertificationDataBuilder({ databaseBuilder });
  }

  if (hasToSeed.evaluation) {
    logger.info('Seeding : evaluation');
    await teamEvaluationDataBuilder({ databaseBuilder });
  }

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  logger.info('END Seeding');
};

function _buildContextToSeed(params) {
  if (params.length === 0) {
    return {
      prescription: true,
      devcomp: true,
      acces: true,
      junior: true,
      content: true,
      certification: true,
      evaluation: true,
    };
  }

  const hasToSeed = {
    prescription: false,
    devcomp: false,
    acces: false,
    junior: false,
    content: false,
    certification: false,
    evaluation: false,
  };

  params.forEach((seedContext) => {
    if (seedContext === 'PRESCRIPTION') hasToSeed.prescription = true;
    if (seedContext === 'DEVCOMP') hasToSeed.devcomp = true;
    if (seedContext === 'JUNIOR') hasToSeed.junior = true;
    if (seedContext === 'ACCES') hasToSeed.acces = true;
    if (seedContext === 'CONTENT') hasToSeed.content = true;
    if (seedContext === 'CERTIF') hasToSeed.certification = true;
    if (seedContext === 'EVAL') hasToSeed.evaluation = true;
  });

  return hasToSeed;
}

export { seed };
