import { knex } from '../../../../db/knex-database-connection.js';
import { MissionAssessment } from '../../domain/models/MissionAssessment.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';

const save = async function ({ missionAssessment }) {
  await knex('mission-assessments').insert({ ...missionAssessment });
};

const getByAssessmentId = async function (assessmentId) {
  const rawAssessmentMission = await knex('mission-assessments')
    .where({ assessmentId: assessmentId })
    .returning('*')
    .first();
  return new MissionAssessment({ ...rawAssessmentMission });
};
const getAllCompletedMissionIds = async function (organizationLearnerId) {
  const raw = await knex('mission-assessments')
    .select('mission-assessments.missionId')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ organizationLearnerId })
    .andWhere({ state: Assessment.states.COMPLETED });

  return raw.map((element) => element.missionId);
};

export { save, getByAssessmentId, getAllCompletedMissionIds };
