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
    isReferer: certificationCenterMembershipDTO.isReferer,
    createdAt: certificationCenterMembershipDTO.createdAt,
    updatedByUserId: certificationCenterMembershipDTO.updatedByUserId,
    updatedAt: certificationCenterMembershipDTO.updatedAt,
    role: certificationCenterMembershipDTO.role,
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
      'certification-centers.updatedAt AS certificationCenterUpdatedAt',
    )
    .from('certification-center-memberships')
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
  const certificationCenterMemberships = await knex('certification-center-memberships')
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
  const certificationCenterMembershipId = await knex('certification-center-memberships')
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

const update = async function (certificationCenterMembership) {
  const data = _.pick(certificationCenterMembership, [
    'disabledAt',
    'isReferer',
    'role',
    'updatedByUserId',
    'updatedAt',
  ]);
  await knex('certification-center-memberships').update(data).where({ id: certificationCenterMembership.id });
};

const findById = async function (certificationCenterMembershipId) {
  const certificationCenterMembership = await knex('certification-center-memberships')
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

const findOneWithCertificationCenterIdAndUserId = async function ({ certificationCenterId, userId }) {
  const certificationCenterMembership = await knex('certification-center-memberships')
    .where({ certificationCenterId, userId })
    .first();

  if (!certificationCenterMembership) return;

  return _toDomain(certificationCenterMembership);
};

export {
  findByUserId,
  findActiveByCertificationCenterIdSortedById,
  findOneWithCertificationCenterIdAndUserId,
  save,
  isAdminOfCertificationCenter,
  isMemberOfCertificationCenter,
  disableById,
  updateRefererStatusByUserIdAndCertificationCenterId,
  getRefererByCertificationCenterId,
  disableMembershipsByUserId,
  update,
  findById,
};
