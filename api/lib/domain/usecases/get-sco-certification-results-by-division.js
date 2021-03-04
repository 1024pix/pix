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

  const publishedCertificationCourses = certificationCourses.filter((course) => course.isPublished);

  const certificationResults = await bluebird.mapSeries(publishedCertificationCourses,
    (certificationCourse) => getCertificationResultByCertifCourse({ certificationCourse }),
  );

  if (isEmpty(certificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};
