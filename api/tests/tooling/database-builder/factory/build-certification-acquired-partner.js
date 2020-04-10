const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationAcquiredPartner({
  certificationCourseId,
  partnerKey = faker.lorem.word,
}) {
  return databaseBuffer.objectsToInsert.push({
    tableName: 'certification-partner-acquisitions', values : { certificationCourseId, partnerKey }
  });
};
