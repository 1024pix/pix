const Badge = require('../../../../lib/domain/models/Badge');
const { CERTIFICATION_COURSE_SUCCESS_ID, CERTIFICATION_COURSE_FAILURE_ID } = require('./certification-courses-builder');
const { PIX_DROIT_MAITRE_BADGE_ID } = require('../badges-builder');
const { CERTIF_DROIT_USER5_ID } = require('./users');
const { CLEA_COMPLEMENTARY_CERTIFICATION_ID, PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID } = require('./certification-centers-builder');

function complementaryCertificationCourseResultBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    userId: CERTIF_DROIT_USER5_ID,
    campaignParticipationId: null,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: Badge.keys.PIX_DROIT_MAITRE_CERTIF });
  databaseBuilder.factory.buildComplementaryCertificationCourse({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID });
  databaseBuilder.factory.buildComplementaryCertificationCourse({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({ certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID, acquired: false, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
}

module.exports = {
  complementaryCertificationCourseResultBuilder,
};
