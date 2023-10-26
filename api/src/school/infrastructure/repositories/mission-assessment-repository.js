import { knex } from '../../../../db/knex-database-connection.js';

const save = async function ({ missionAssessment }) {
  await knex('mission-assessments').insert({ ...missionAssessment });
};

export { save };
