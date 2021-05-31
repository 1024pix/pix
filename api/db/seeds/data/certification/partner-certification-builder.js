const Badge = require('../../../../lib/domain/models/Badge');
const { CERTIFICATION_COURSE_SUCCESS_ID, CERTIFICATION_COURSE_FAILURE_ID } = require('./certification-courses-builder');
const { PIX_DROIT_MAITRE_BADGE_ID } = require('../badges-builder');
const { CERTIF_SUCCESS_USER_ID } = require('./user-profiles-builder');

function partnerCertificationBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    userId: CERTIF_SUCCESS_USER_ID,
    campaignParticipationId: null,
  });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: 'PIX_DROIT_MAITRE_CERTIF' });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID, acquired: false, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
}

module.exports = {
  partnerCertificationBuilder,
};
