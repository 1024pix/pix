const Badge = require('../../../../lib/domain/models/Badge');
const { CERTIFICATION_COURSE_SUCCESS_ID, CERTIFICATION_COURSE_FAILURE_ID } = require('./certification-courses-builder');

function partnerCertificationBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID, acquired: true, partnerKey: 'PIX_DROIT_MAITRE_CERTIF' });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID, acquired: false, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
}

module.exports = {
  partnerCertificationBuilder,
};
