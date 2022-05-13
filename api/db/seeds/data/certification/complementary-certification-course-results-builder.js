const Badge = require('../../../../lib/domain/models/Badge');
const {
  CERTIFICATION_COURSE_SUCCESS_ID,
  CERTIFICATION_COURSE_FAILURE_ID,
  CERTIFICATION_COURSE_EDU_ID,
} = require('./certification-courses-builder');
const { PIX_DROIT_MAITRE_BADGE_ID } = require('../badges-builder');
const { CERTIF_DROIT_USER5_ID } = require('./users');
const {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} = require('./certification-centers-builder');

function complementaryCertificationCourseResultsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    userId: CERTIF_DROIT_USER5_ID,
    campaignParticipationId: null,
  });
  const { id: complementaryCertifCourseSuccessCleaId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessCleaId,
    acquired: true,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA_V3,
  });

  const { id: complementaryCertifCourseFailureId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseFailureId,
    acquired: false,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA_V3,
  });

  const { id: complementaryCertifCourseSuccessDroitId } = databaseBuilder.factory.buildComplementaryCertificationCourse(
    {
      certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
      complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    },
  );
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessDroitId,
    acquired: true,
    partnerKey: Badge.keys.PIX_DROIT_MAITRE_CERTIF,
  });

  const { id: complementaryCertifCourseEduId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_EDU_ID,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseEduId,
    acquired: true,
    partnerKey: Badge.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  });
}

module.exports = {
  complementaryCertificationCourseResultsBuilder,
};
