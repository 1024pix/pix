const bookshelfUtils = require('../utils/bookshelf-utils');
const BookshelfCertificationCenterMembership = require('../data/certification-center-membership');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { CertificationCenterMembershipCreationError, AlreadyExistingMembershipError } = require('../../domain/errors');

module.exports = {

  async findByUserId(userId) {
    const certificationCenterMemberships = await BookshelfCertificationCenterMembership
      .where({ userId: userId })
      .fetchAll({
        withRelated: [
          'certificationCenter',
        ]
      });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfCertificationCenterMembership, certificationCenterMemberships);
  },

  async create(userId, certificationCenterId) {
    try {
      const newCertificationCenterMembership = await new BookshelfCertificationCenterMembership({ userId, certificationCenterId })
        .save();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationCenterMembership, newCertificationCenterMembership);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingMembershipError(`User is already member of certification center ${certificationCenterId}`);
      }
      if (bookshelfUtils.foreignKeyConstraintViolated(err)) {
        throw new CertificationCenterMembershipCreationError();
      }
      throw err;
    }
  },

};
