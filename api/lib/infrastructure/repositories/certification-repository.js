import { knex } from '../../../db/knex-database-connection.js';

const unpublishCertificationCoursesBySessionId = async function (sessionId) {
  await knex('certification-courses').where({ sessionId }).update({ isPublished: false, updatedAt: new Date() });
};

export { unpublishCertificationCoursesBySessionId };
