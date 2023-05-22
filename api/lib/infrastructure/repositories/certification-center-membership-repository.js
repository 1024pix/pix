import * as knexUtils from '../utils/knex-utils.js';
import { BookshelfCertificationCenterMembership } from '../orm-models/CertificationCenterMembership.js';
import * as bookshelfToDomainConverter from '../../infrastructure/utils/bookshelf-to-domain-converter.js';

import {
  CertificationCenterMembershipCreationError,
  AlreadyExistingMembershipError,
  CertificationCenterMembershipDisableError,
} from '../../domain/errors.js';

import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCenter } from '../../domain/models/CertificationCenter.js';
import { User } from '../../domain/models/User.js';
import { CertificationCenterMembership } from '../../domain/models/CertificationCenterMembership.js';
import { DomainTransaction } from '../DomainTransaction.js';

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

const findByUserId = async function (userId) {
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
};

const findActiveByCertificationCenterIdSortedById = async function ({ certificationCenterId }) {
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
};

const save = async function ({ userId, certificationCenterId }) {
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
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingMembershipError(
        `User is already member of certification center ${certificationCenterId}`
      );
    }
    if (knexUtils.foreignKeyConstraintViolated(err)) {
      throw new CertificationCenterMembershipCreationError();
    }
    throw err;
  }
};

const isMemberOfCertificationCenter = async function ({ userId, certificationCenterId }) {
  const certificationCenterMembershipId = await knex('certification-center-memberships')
    .select('id')
    .where({
      userId,
      certificationCenterId,
      disabledAt: null,
    })
    .first();

  return Boolean(certificationCenterMembershipId);
};

const disableById = async function ({ certificationCenterMembershipId }) {
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
};

const updateRefererStatusByUserIdAndCertificationCenterId = async function ({
  userId,
  certificationCenterId,
  isReferer,
}) {
  await knex('certification-center-memberships').where({ userId, certificationCenterId }).update({ isReferer });
};

const getRefererByCertificationCenterId = async function ({ certificationCenterId }) {
  const refererCertificationCenterMembership = await knex('certification-center-memberships')
    .select('certification-center-memberships.*', 'users.lastName', 'users.firstName', 'users.email')
    .join('users', 'users.id', 'certification-center-memberships.userId')
    .where({ certificationCenterId, isReferer: true })
    .first();

  if (!refererCertificationCenterMembership) {
    return null;
  }

  return _toDomain(refererCertificationCenterMembership);
};

const disableMembershipsByUserId = async function ({
  userId,
  updatedByUserId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  await knexConn('certification-center-memberships')
    .whereNull('disabledAt')
    .andWhere({ userId })
    .update({ disabledAt: new Date(), updatedByUserId });
};

export {
  findByUserId,
  findActiveByCertificationCenterIdSortedById,
  save,
  isMemberOfCertificationCenter,
  disableById,
  updateRefererStatusByUserIdAndCertificationCenterId,
  getRefererByCertificationCenterId,
  disableMembershipsByUserId,
};
