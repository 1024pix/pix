const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildPartnerCertification({
  certificationCourseId,
  partnerKey = faker.lorem.word,
  acquired = true,
}) {
  return databaseBuffer.objectsToInsert.push({
    tableName: 'partner-certifications', values : { certificationCourseId, partnerKey, acquired }
  });
};
