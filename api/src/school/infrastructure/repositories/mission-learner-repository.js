import { SchoolLearner } from '../../domain/models/SchoolLearner.js';

const findPaginatedMissionLearners = async function ({ organizationId, page, organizationLearnerApi }) {
  const { organizationLearners, pagination } = await organizationLearnerApi.find({ organizationId, page });

  const missionLearners = organizationLearners.map((missionLearner) => new SchoolLearner({ ...missionLearner }));
  return { missionLearners, pagination };
};

export { findPaginatedMissionLearners };
