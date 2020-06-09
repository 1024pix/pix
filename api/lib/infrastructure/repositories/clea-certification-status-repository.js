const PartnerCertificationBookshelf = require('../data/partner-certification');
const Badge = require('../../../lib/domain/models/Badge');

const statuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_PASSED: 'not_passed',
};

module.exports = {

  statuses,

  async getCleaCertificationStatus(certificationCourseId) {
    const response = await PartnerCertificationBookshelf.query((qb) => {
      qb.where({ certificationCourseId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA });
    })
      .fetch({ required: false, columns: ['acquired'] });
      
    if (response) {
      return response.attributes.acquired ? statuses.ACQUIRED : statuses.REJECTED;
    }
    return statuses.NOT_PASSED;
  }
};
