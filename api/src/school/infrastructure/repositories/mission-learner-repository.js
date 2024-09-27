import { SchoolLearner } from '../../domain/models/SchoolLearner.js';

const findMissionLearners = async function ({ organizationId, filter, organizationLearnerApi }) {
  const { organizationLearners } = await organizationLearnerApi.find({ organizationId, filter });

  const missionLearners = organizationLearners.map((missionLearner) => new SchoolLearner({ ...missionLearner }));
  return { missionLearners };
};

export { findMissionLearners };
