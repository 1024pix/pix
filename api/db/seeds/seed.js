import { knex as datamartKnex } from '../../datamart/knex-database-connection.js';
import { config } from '../../src/shared/config.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { DatabaseBuilder } from '../database-builder/database-builder.js';
import { databaseConnection } from '../knex-database-connection.js';
import { commonBuilder } from './data/common/common-builder.js';
import { complementaryCertificationBuilder } from './data/common/complementary-certification-builder.js';
import { featuresBuilder } from './data/common/feature-builder.js';
import { learningContentBuilder } from './data/common/learningcontent-builder.js';
import { organizationBuilder } from './data/common/organization-builder.js';
import { organizationLearnerImportFormat } from './data/common/organization-learner-import-formats.js';
import { tagsBuilder } from './data/common/tag-builder.js';
import { team1dDataBuilder } from './data/team-1d/data-builder.js';
import { teamAccesDataBuilder } from './data/team-acces/data-builder.js';
import { teamAcquisitionDataBuilder } from './data/team-acquisition/data-builder.js';
import { teamCertificationDataBuilder } from './data/team-certification/data-builder.js';
import { teamContenuDataBuilder } from './data/team-contenu/data-builder.js';
import { teamDevcompDataBuilder } from './data/team-devcomp/data-builder.js';
import { teamEvaluationDataBuilder } from './data/team-evaluation/data-builder.js';
import { teamPrescriptionDataBuilder } from './data/team-prescription/data-builder.js';

export async function seed() {
  logger.info('START Seeding');

  const databaseBuilder = new DatabaseBuilder({ databaseConnection });

  // Learning content
  logger.info('Seeding: Learning content');
  await learningContentBuilder({ databaseBuilder });

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
  if (config.seeds.context.prescription) {
    logger.info('Seeding : Prescription');
    await teamPrescriptionDataBuilder({ databaseBuilder });
  }

  if (config.seeds.context.devcomp) {
    logger.info('Seeding : Devcomp');
    await teamDevcompDataBuilder({ databaseBuilder });
  }

  if (config.seeds.context.acces) {
    logger.info('Seeding : Acces');
    await teamAccesDataBuilder(databaseBuilder);
  }

  if (config.seeds.context.junior) {
    logger.info('Seeding : Junior');
    await team1dDataBuilder(databaseBuilder);
  }

  if (config.seeds.context.contenu) {
    logger.info('Seeding : Contenu');
    await teamContenuDataBuilder({ databaseBuilder });
  }

  if (config.seeds.context.certification) {
    logger.info('Seeding : Certification');
    await complementaryCertificationBuilder({ databaseBuilder });
    await teamCertificationDataBuilder({ databaseBuilder, datamartKnex });
  }

  if (config.seeds.context.evaluation) {
    logger.info('Seeding : Evaluation');
    await teamEvaluationDataBuilder({ databaseBuilder });
  }

  if (config.seeds.context.acquisition) {
    logger.info('Seeding : Acquisition');
    teamAcquisitionDataBuilder({ databaseBuilder });
  }

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  logger.info('END Seeding');
}
