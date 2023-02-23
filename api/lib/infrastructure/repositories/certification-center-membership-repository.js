const bookshelfUtils = require('../utils/knex-utils.js');
const BookshelfCertificationCenterMembership = require('../orm-models/CertificationCenterMembership.js');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter.js');
const {
  CertificationCenterMembershipCreationError,
  AlreadyExistingMembershipError,
  CertificationCenterMembershipDisableError,
} = require('../../domain/errors.js');
const { knex } = require('../../../db/knex-database-connection.js');
const CertificationCenter = require('../../domain/models/CertificationCenter.js');
const User = require('../../domain/models/User.js');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership.js');
const DomainTransaction = require('../DomainTransaction.js');

function _toDomain(certificationCenterMembershipDTO) {
  let user, certificationCenter;
  if (certificationCenterMembershipDTO.lastName || certificationCenterMembershipDTO.firstName) {
    user = new User({
      id: certificationCenterMembershipDTO.userId,
      firstName: certificationCenterMembershipDTO.firstName,
      lastName: certificationCenterMembershipDTO.lastName,
      email: certificationCenterMembershipDTO.email,
    });
  }
  if (certificationCenterMembershipDTO.name) {
    certificationCenter = new CertificationCenter({
      id: certificationCenterMembershipDTO.certificationCenterId,
      name: certificationCenterMembershipDTO.name,
      type: certificationCenterMembershipDTO.type,
      externalId: certificationCenterMembershipDTO.externalId,
      createdAt: certificationCenterMembershipDTO.certificationCenterCreatedAt,
      updatedAt: certificationCenterMembershipDTO.certificationCenterUpdatedAt,
    });
  }
  return new CertificationCenterMembership({
    id: certificationCenterMembershipDTO.id,
    certificationCenter,
    user,
    createdAt: certificationCenterMembershipDTO.createdAt,
    updatedAt: certificationCenterMembershipDTO.updatedAt,
  });
}

module.exports = {
  async findByUserId(userId) {
    const certificationCenterMemberships = await knex
      .select(
        'certification-center-memberships.*',
        'certification-centers.name',
        'certification-centers.type',
        'certification-centers.externalId',
        'certification-centers.createdAt AS certificationCenterCreatedAt',
        'certification-centers.updatedAt AS certificationCenterUpdatedAt'
      )
      .from('certification-center-memberships')
      .leftJoin(
        'certification-centers',
        'certification-centers.id',
        'certification-center-memberships.certificationCenterId'
      )
      .where({
        userId,
        disabledAt: null,
      });

    return certificationCenterMemberships.map(_toDomain);
  },

  async findActiveByCertificationCenterIdSortedById({ certificationCenterId }) {
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

  async isMemberOfCertificationCenter({ userId, certificationCenterId }) {
    const certificationCenterMembershipId = await knex('certification-center-memberships')
      .select('id')
      .where({
        userId,
        certificationCenterId,
        disabledAt: null,
      })
      .first();

    return Boolean(certificationCenterMembershipId);
  },

  async disableById({ certificationCenterMembershipId }) {
    try {
      const now = new Date();
      const result = await knex('certification-center-memberships')
        .where({ id: certificationCenterMembershipId })
        .update({ disabledAt: now })
        .returning('*');

      if (result.length === 0) {
        throw new CertificationCenterMembershipDisableError();
      }
    } catch (e) {
      throw new CertificationCenterMembershipDisableError();
    }
  },

  async updateRefererStatusByUserIdAndCertificationCenterId({ userId, certificationCenterId, isReferer }) {
    await knex('certification-center-memberships').where({ userId, certificationCenterId }).update({ isReferer });
  },

  async getRefererByCertificationCenterId({ certificationCenterId }) {
    const refererCertificationCenterMembership = await knex('certification-center-memberships')
      .select('certification-center-memberships.*', 'users.lastName', 'users.firstName', 'users.email')
      .join('users', 'users.id', 'certification-center-memberships.userId')
      .where({ certificationCenterId, isReferer: true })
      .first();

    if (!refererCertificationCenterMembership) {
      return null;
    }

    return _toDomain(refererCertificationCenterMembership);
  },

  async disableMembershipsByUserId({
    userId,
    updatedByUserId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction.knexTransaction ?? knex;
    await knexConn('certification-center-memberships')
      .whereNull('disabledAt')
      .andWhere({ userId })
      .update({ disabledAt: new Date(), updatedByUserId });
  },
};
