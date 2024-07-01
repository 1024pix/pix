import { SchoolLearner } from '../../domain/models/SchoolLearner.js';

const findPaginatedMissionLearners = async function ({ organizationId, page, filter, organizationLearnerApi }) {
  const { organizationLearners, pagination } = await organizationLearnerApi.find({ organizationId, page, filter });

  const missionLearners = organizationLearners.map((missionLearner) => new SchoolLearner({ ...missionLearner }));
  return { missionLearners, pagination };
};

export { findPaginatedMissionLearners };
