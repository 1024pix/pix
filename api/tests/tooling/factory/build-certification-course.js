const CertificationCourse = require('../../../lib/domain/models/CertificationCourse');

module.exports = function buildCertificationCourse({
  id= 1,
  userId= 1,
  completedAt= new Date('2018-12-01'),
  createdAt= new Date('2018-12-01'),
  firstName= 'Prenom',
  lastName= 'Nom',
  birthplace= 'Paris',
  birthdate= '21/03/1991',
  sessionId= 1,
  externalId= 'nomDeLaPersonne',
  isPublished= false,
} = {}) {

  const certificationCourse = CertificationCourse.fromAttributes({
    id,
    userId,
    completedAt,
    createdAt,
    firstName,
    lastName,
    birthplace,
    birthdate,
    sessionId,
    externalId,
    isPublished,
  });

  return certificationCourse;
};
