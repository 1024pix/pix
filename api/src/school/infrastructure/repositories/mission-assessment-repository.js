import { knex } from '../../../../db/knex-database-connection.js';
import { MissionAssessment } from '../../domain/models/MissionAssessment.js';

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

export { save, getByAssessmentId };
