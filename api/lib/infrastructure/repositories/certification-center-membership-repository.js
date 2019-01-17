const BookshelfCertificationCenterMembership = require('../data/certification-center-membership');
const { AlreadyExistingMembershipError } = require('../../domain/errors');
const { InfrastructureError } = require('../../infrastructure/errors');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(certificationCenterMembership) {

  const certificationCenter = new CertificationCenter({
    id: certificationCenterMembership.get('certificationCenterId'),
  });

  return new CertificationCenterMembership({
    id: certificationCenterMembership.get('id'),
    userId: certificationCenterMembership.get('userId'),
    certificationCenter,
  });
}

module.exports = {

  create(userId, certificationCenterId) {
    return new BookshelfCertificationCenterMembership({ userId, certificationCenterId })
      .save()
      .then(_toDomain)
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new AlreadyExistingMembershipError();
        }
        throw new InfrastructureError(err);
      });
  },

};
