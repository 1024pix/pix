import ApplicationSerializer from './application';

const include = ['versionSummaries', 'complementaryCertification'];

export default ApplicationSerializer.extend({
  include,

  shouldIncludeLinkageData(relationshipKey) {
    return relationshipKey === 'versionSummaries';
  },

  links(certificationFramework) {
    return {
      complementaryCertification: {
        related: `/api/admin/complementary-certifications/${certificationFramework.id}/target-profiles`,
      },
    };
  },
});
