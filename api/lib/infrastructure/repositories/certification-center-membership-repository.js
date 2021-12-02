const bookshelfUtils = require('../utils/knex-utils');
const BookshelfCertificationCenterMembership = require('../orm-models/CertificationCenterMembership');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const {
  CertificationCenterMembershipCreationError,
  AlreadyExistingMembershipError,
  CertificationCenterMembershipDisableError,
} = require('../../domain/errors');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async findByUserId(userId) {
    const certificationCenterMemberships = await BookshelfCertificationCenterMembership.where({ userId }).fetchAll({
      withRelated: ['certificationCenter'],
    });

    return bookshelfToDomainConverter.buildDomainObjects(
      BookshelfCertificationCenterMembership,
      certificationCenterMemberships
    );
  },

  async findActiveByCertificationCenterId(certificationCenterId) {
    const certificationCenterMemberships = await BookshelfCertificationCenterMembership.where({
      certificationCenterId,
      disabledAt: null,
    })
      .orderBy('id', 'ASC')
      .fetchAll({
        withRelated: ['certificationCenter', 'user'],
      });

    return bookshelfToDomainConverter.buildDomainObjects(
      BookshelfCertificationCenterMembership,
      certificationCenterMemberships
    );
  },

  async save({ userId, certificationCenterId }) {
    try {
      const newCertificationCenterMembership = await new BookshelfCertificationCenterMembership({
        userId,
        certificationCenterId,
      })
        .save()
        .then((model) => model.fetch({ withRelated: ['user', 'certificationCenter'] }));

      return bookshelfToDomainConverter.buildDomainObject(
        BookshelfCertificationCenterMembership,
        newCertificationCenterMembership
      );
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingMembershipError(
          `User is already member of certification center ${certificationCenterId}`
        );
      }
      if (bookshelfUtils.foreignKeyConstraintViolated(err)) {
        throw new CertificationCenterMembershipCreationError();
      }
      throw err;
    }
  },

  async isMemberOfCertificationCenter(userId, certificationCenterId) {
    const certificationCenterMembership = await BookshelfCertificationCenterMembership.where({
      userId,
      certificationCenterId,
    }).fetch({ require: false, columns: 'id' });
    return Boolean(certificationCenterMembership);
  },

  async disableById({ certificationCenterMembershipId }) {
    try {
      const now = new Date();
      const [certificationCenterMembershipDTO] = await knex('certification-center-memberships')
        .where({ id: certificationCenterMembershipId })
        .update({ disabledAt: now })
        .returning('*');

      return _toDomain({ certificationCenterMembershipDTO });
    } catch (e) {
      throw new CertificationCenterMembershipDisableError();
    }
  },
};

function _toDomain({ certificationCenterMembershipDTO }) {
  return new CertificationCenterMembership({
    id: certificationCenterMembershipDTO.id,
    certificationCenter: { id: certificationCenterMembershipDTO.certificationCenterId },
    user: { id: certificationCenterMembershipDTO.userId },
    createdAt: certificationCenterMembershipDTO.createdAt,
    disabledAt: certificationCenterMembershipDTO.disabledAt,
  });
}
