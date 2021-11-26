const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertificationCourse({
  complementaryCertificationId,
  certificationCourseId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  const values = {
    complementaryCertificationId,
    certificationCourseId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-courses',
    values,
  });
};
