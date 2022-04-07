const buildComplementaryCertification = require('./build-complementary-certification');
const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertificationCourse({
  id = databaseBuffer.getNextId(),
  complementaryCertificationId,
  certificationCourseId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  complementaryCertificationId = complementaryCertificationId
    ? complementaryCertificationId
    : buildComplementaryCertification().id;
  const values = {
    id,
    complementaryCertificationId,
    certificationCourseId,
    createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-courses',
    values,
  });
};
