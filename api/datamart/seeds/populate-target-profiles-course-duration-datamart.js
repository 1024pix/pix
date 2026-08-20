import { DatamartBuilder } from '../../datamart/datamart-builder/datamart-builder.js';
import { TARGET_PROFILE_BADGES_STAGES_ID } from '../../db/seeds/data/team-prescription/constants.js';
import { databaseConnection } from '../knex-database-connection.js';

export async function seed() {
  const datamartBuilder = new DatamartBuilder({ databaseConnection });
  datamartBuilder.factory.buildTargetProfileCourseDuration({
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    median: 312,
    quantile_75: 513,
    quantile_95: 963,
  });
  await datamartBuilder.commit();
}
