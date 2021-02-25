const bluebird = require('bluebird');
const isEmpty = require('lodash/isEmpty');
const { NoCertificationResultForDivision } = require('../errors');

module.exports = async function getScoCertificationResultsByDivision({
  organizationId,
  division,
  scoCertificationCandidateRepository,
  certificationCourseRepository,
  getCertificationResultByCertifCourse,
}) {
  const candidateIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({ organizationId, division });
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesByCandidateIds({ candidateIds });

  const certificationResults = await bluebird.mapSeries(certificationCourses,
    (certificationCourse) => getCertificationResultByCertifCourse({ certificationCourse }),
  );

  if (isEmpty(certificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};
