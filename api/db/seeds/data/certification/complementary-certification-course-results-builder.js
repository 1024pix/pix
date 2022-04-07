const Badge = require('../../../../lib/domain/models/Badge');
const { CERTIFICATION_COURSE_SUCCESS_ID, CERTIFICATION_COURSE_FAILURE_ID } = require('./certification-courses-builder');
const { PIX_DROIT_MAITRE_BADGE_ID } = require('../badges-builder');
const { CERTIF_DROIT_USER5_ID } = require('./users');
const {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
} = require('./certification-centers-builder');

function complementaryCertificationCourseResultsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    userId: CERTIF_DROIT_USER5_ID,
    campaignParticipationId: null,
  });
  const { id: complementaryCertifCourseSuccessId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessId,
    acquired: true,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  const { id: complementaryCertifCourseFailureId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseFailureId,
    acquired: false,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessId,
    acquired: true,
    partnerKey: Badge.keys.PIX_DROIT_MAITRE_CERTIF,
  });

  databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });
}

module.exports = {
  complementaryCertificationCourseResultsBuilder,
};
