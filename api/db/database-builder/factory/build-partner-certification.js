const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const buildBadge = require('./build-badge');

module.exports = function buildPartnerCertification({
  certificationCourseId,
  partnerKey,
  acquired = faker.random.boolean(),
}) {
  partnerKey = partnerKey ? partnerKey : buildBadge().key;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'partner-certifications', values: { certificationCourseId, partnerKey, acquired },
  });
};
