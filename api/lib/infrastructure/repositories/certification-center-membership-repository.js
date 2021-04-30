const bookshelfUtils = require('../utils/knex-utils');
const BookshelfCertificationCenterMembership = require('../data/certification-center-membership');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const { CertificationCenterMembershipCreationError, AlreadyExistingMembershipError } = require('../../domain/errors');

module.exports = {

  async findByUserId(userId) {
    const certificationCenterMemberships = await BookshelfCertificationCenterMembership
      .where({ userId })
      .fetchAll({
        withRelated: [
          'certificationCenter',
        ],
      });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfCertificationCenterMembership, certificationCenterMemberships);
  },

  async findByCertificationCenterId(certificationCenterId) {
    const certificationCenterMemberships = await BookshelfCertificationCenterMembership
      .where({ certificationCenterId })
      .orderBy('id', 'ASC')
      .fetchAll({
        withRelated: [
          'certificationCenter',
          'user',
        ],
      });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfCertificationCenterMembership, certificationCenterMemberships);
  },

  async save(userId, certificationCenterId, domainTransaction = DomainTransaction.emptyTransaction()) {
    try {
      const newCertificationCenterMembership = await new BookshelfCertificationCenterMembership({
        userId,
        certificationCenterId,
      })
        .save(null, { transacting: domainTransaction.knexTransaction })
        .then((model) => model.fetch({ withRelated: ['user', 'certificationCenter'], transacting: domainTransaction.knexTransaction }));

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

  async isMemberOfCertificationCenter(userId, certificationCenterId) {
    const certificationCenterMembership = await BookshelfCertificationCenterMembership
      .where({ userId, certificationCenterId })
      .fetch({ require: false, columns: 'id' });
    return Boolean(certificationCenterMembership);
  },

  async doesUserHaveMembershipToAnyCertificationCenter(userId) {
    const certificationCenterMembership = await BookshelfCertificationCenterMembership
      .where({ userId })
      .fetch({ require: false, columns: 'id' });
    return Boolean(certificationCenterMembership);
  },

};
