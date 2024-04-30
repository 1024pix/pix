import { MissionLearner } from '../../domain/models/MissionLearner.js';

const findPaginatedMissionLearners = async function ({ organizationId, page, organizationLearnerApi }) {
  const { organizationLearners, pagination } = await organizationLearnerApi.find({ organizationId, page });

  const missionLearners = organizationLearners.map((missionLearner) => new MissionLearner({ ...missionLearner }));
  return { missionLearners, pagination };
};

export { findPaginatedMissionLearners };
