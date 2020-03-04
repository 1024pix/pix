const BookshelfCertificationCenterMembership = require('../data/certification-center-membership');
const { CertificationCenterMembershipCreationError, AlreadyExistingMembershipError } = require('../../domain/errors');
const { HttpError } = require('../../application/http-errors');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(certificationCenterMembershipBookshelf) {
  return new CertificationCenterMembership({
    id: certificationCenterMembershipBookshelf.get('id'),
    certificationCenter: new CertificationCenter({
      id: certificationCenterMembershipBookshelf.related('certificationCenter').get('id'),
      name: certificationCenterMembershipBookshelf.related('certificationCenter').get('name'),
    })
  });
}

module.exports = {

  findByUserId(userId) {
    return BookshelfCertificationCenterMembership
      .where({ userId: userId })
      .fetchAll({
        withRelated: [
          'certificationCenter',
        ]
      })
      .then((certificationCenterMemberships) => certificationCenterMemberships.map(_toDomain));
  },

  create(userId, certificationCenterId) {
    return new BookshelfCertificationCenterMembership({ userId, certificationCenterId })
      .save()
      .then(_toDomain)
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new AlreadyExistingMembershipError(`User is already member of certification center ${certificationCenterId}`);
        }
        if (bookshelfUtils.foreignKeyConstraintViolated(err)) {
          throw new CertificationCenterMembershipCreationError();
        }
        throw new HttpError(err);
      });
  },

};
