import { knex } from '../../../../db/knex-database-connection.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { MissionLearner } from '../../domain/models/MissionLearner.js';

const findPaginatedMissionLearners = async function ({ organizationId, page }) {
  const { results, pagination } = await fetchPage(
    knex('organization-learners').select('*').where({ organizationId: organizationId }),
    page,
  );

  const missionLearners = results.map((missionLearner) => new MissionLearner({ ...missionLearner }));
  return { missionLearners, pagination };
};

export { findPaginatedMissionLearners };
