import { DatabaseBuilder } from '../database-builder/database-builder.js';

import { commonBuilder } from './data/common/common-builder.js';
import { featuresBuilder } from './data/common/feature-builder.js';
import { organizationBuilder } from './data/common/organization-builder.js';

import { teamDevcompDataBuilder } from './data/team-devcomp/data-builder.js';
import { teamAccesDataBuilder } from './data/team-acces/data-builder.js';
import { team1dDataBuilder } from './data/team-1d/data-builder.js';
import { teamContenuDataBuilder } from './data/team-contenu/data-builder.js';
import { teamCertificationDataBuilder } from './data/team-certification/data-builder.js';
import { teamPrescriptionDataBuilder } from './data/team-prescription/data-builder.js';
import { teamEvaluationDataBuilder } from './data/team-evaluation/data-builder.js';

const seed = async function (knex) {
  const databaseBuilder = new DatabaseBuilder({ knex });
  // This is needed when you have to re-seed database that is fully migrated (ex: on Scalingo you can't drop database)
  await featuresBuilder({ databaseBuilder });
  await organizationBuilder({ databaseBuilder });
  await commonBuilder({ databaseBuilder });

  await teamPrescriptionDataBuilder({ databaseBuilder });
  await teamDevcompDataBuilder({ databaseBuilder });

  await teamAccesDataBuilder(databaseBuilder);
  await team1dDataBuilder({ databaseBuilder });
  await teamContenuDataBuilder({ databaseBuilder });
  await teamCertificationDataBuilder({ databaseBuilder });
  await teamEvaluationDataBuilder({ databaseBuilder });

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
};

export { seed };
