import _ from 'lodash';

import * as knexUtils from '../utils/knex-utils.js';
import { BookshelfCertificationCenterMembership } from '../orm-models/CertificationCenterMembership.js';
import * as bookshelfToDomainConverter from '../../infrastructure/utils/bookshelf-to-domain-converter.js';

import {
  CertificationCenterMembershipCreationError,
  AlreadyExistingMembershipError,
  CertificationCenterMembershipDisableError,
  NotFoundError,
} from '../../domain/errors.js';

import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCenter } from '../../domain/models/CertificationCenter.js';
import { User } from '../../domain/models/User.js';
import {
  CERTIFICATION_CENTER_MEMBERSHIP_ROLES,
  CertificationCenterMembership,
} from '../../domain/models/CertificationCenterMembership.js';
import { DomainTransaction } from '../DomainTransaction.js';

const CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME = 'certification-center-memberships';

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
    isReferer: certificationCenterMembershipDTO.isReferer,
    createdAt: certificationCenterMembershipDTO.createdAt,
    updatedByUserId: certificationCenterMembershipDTO.updatedByUserId,
    updatedAt: certificationCenterMembershipDTO.updatedAt,
    role: certificationCenterMembershipDTO.role,
  });
}

const countAdminMembersForCertificationCenter = async function (certificationCenterId) {
  const { count } = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .where({ certificationCenterId, role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN })
    .count('id')
    .first();
  return count;
};

const countMembersForCertificationCenter = async function (certificationCenterId) {
  const { count } = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .where({ certificationCenterId })
    .count('id')
    .first();
  return count;
};

const create = async function ({ certificationCenterId, role, userId }) {
  await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME).insert({ certificationCenterId, role, userId });
};

const findByUserId = async function (userId) {
  const certificationCenterMemberships = await knex
    .select(
      'certification-center-memberships.*',
      'certification-centers.name',
      'certification-centers.type',
      'certification-centers.externalId',
      'certification-centers.createdAt AS certificationCenterCreatedAt',
      'certification-centers.updatedAt AS certificationCenterUpdatedAt',
    )
    .from(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .leftJoin(
      'certification-centers',
      'certification-centers.id',
      'certification-center-memberships.certificationCenterId',
    )
    .where({
      userId,
      disabledAt: null,
    });

  return certificationCenterMemberships.map(_toDomain);
};

const findActiveByCertificationCenterIdSortedById = async function ({ certificationCenterId }) {
  const certificationCenterMemberships = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .select(
      'certification-center-memberships.*',
      'users.firstName',
      'users.lastName',
      'users.email',
      'certification-centers.name',
      'certification-centers.type',
      'certification-centers.externalId',
      'certification-centers.createdAt AS certificationCenterCreatedAt',
      'certification-centers.updatedAt AS certificationCenterUpdatedAt',
    )
    .join('certification-centers', 'certification-center-memberships.certificationCenterId', 'certification-centers.id')
    .join('users', 'certification-center-memberships.userId', 'users.id')
    .where({
      certificationCenterId,
      disabledAt: null,
    })
    .orderBy('certification-center-memberships.id', 'ASC');

  return certificationCenterMemberships.map(_toDomain);
};

/**
 * @deprecated use create method if you don't need the model in return with his relations (User & CertificationCenter)
 */
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
      newCertificationCenterMembership,
    );
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingMembershipError(
        `User is already member of certification center ${certificationCenterId}`,
      );
    }
    if (knexUtils.foreignKeyConstraintViolated(err)) {
      throw new CertificationCenterMembershipCreationError();
    }
    throw err;
  }
};

const isAdminOfCertificationCenter = async function ({ userId, certificationCenterId }) {
  const certificationCenterMembershipId = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .select('id')
    .where({
      userId,
      certificationCenterId,
      disabledAt: null,
      role: 'ADMIN',
    })
    .first();

  return Boolean(certificationCenterMembershipId);
};

const isMemberOfCertificationCenter = async function ({ userId, certificationCenterId }) {
  const certificationCenterMembershipId = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
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
    const result = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
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
  await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME).where({ userId, certificationCenterId }).update({ isReferer });
};

const getRefererByCertificationCenterId = async function ({ certificationCenterId }) {
  const refererCertificationCenterMembership = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
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
  await knexConn(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .whereNull('disabledAt')
    .andWhere({ userId })
    .update({ disabledAt: new Date(), updatedByUserId });
};

const update = async function (certificationCenterMembership) {
  const data = _.pick(certificationCenterMembership, [
    'disabledAt',
    'isReferer',
    'role',
    'updatedByUserId',
    'updatedAt',
  ]);
  await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME).update(data).where({ id: certificationCenterMembership.id });
};

const findById = async function (certificationCenterMembershipId) {
  const certificationCenterMembership = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .select(
      'certification-center-memberships.*',
      'users.lastName',
      'users.firstName',
      'users.email',
      'certification-centers.name',
      'certification-centers.type',
      'certification-centers.externalId',
      'certification-centers.createdAt AS certificationCenterCreatedAt',
      'certification-centers.updatedAt AS certificationCenterUpdatedAt',
    )
    .join('users', 'certification-center-memberships.userId', 'users.id')
    .join('certification-centers', 'certification-center-memberships.certificationCenterId', 'certification-centers.id')
    .where({ 'certification-center-memberships.id': certificationCenterMembershipId })
    .first();

  if (!certificationCenterMembership) {
    throw new NotFoundError(`Cannot find a certification center membership for id ${certificationCenterMembershipId}`);
  }

  return _toDomain(certificationCenterMembership);
};

export {
  countAdminMembersForCertificationCenter,
  countMembersForCertificationCenter,
  create,
  disableById,
  disableMembershipsByUserId,
  findActiveByCertificationCenterIdSortedById,
  findById,
  findByUserId,
  getRefererByCertificationCenterId,
  isAdminOfCertificationCenter,
  isMemberOfCertificationCenter,
  save,
  update,
  updateRefererStatusByUserIdAndCertificationCenterId,
};
