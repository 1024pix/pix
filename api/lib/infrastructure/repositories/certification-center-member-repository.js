import _ from 'lodash';
import { NotFoundError } from '../../domain/errors.js';

import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCenter } from '../../domain/models/CertificationCenter.js';
import { User } from '../../domain/models/User.js';
import { CertificationCenterMember } from '../../domain/models/CertificationCenterMember.js';

const CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME = 'certification-center-memberships';

function _toDomain(certificationCenterMemberDTO) {
  let user, certificationCenter;
  if (certificationCenterMemberDTO.lastName || certificationCenterMemberDTO.firstName) {
    user = new User({
      id: certificationCenterMemberDTO.userId,
      firstName: certificationCenterMemberDTO.firstName,
      lastName: certificationCenterMemberDTO.lastName,
      email: certificationCenterMemberDTO.email,
    });
  }
  if (certificationCenterMemberDTO.name) {
    certificationCenter = new CertificationCenter({
      id: certificationCenterMemberDTO.certificationCenterId,
      name: certificationCenterMemberDTO.name,
      type: certificationCenterMemberDTO.type,
      externalId: certificationCenterMemberDTO.externalId,
      createdAt: certificationCenterMemberDTO.certificationCenterCreatedAt,
      updatedAt: certificationCenterMemberDTO.certificationCenterUpdatedAt,
    });
  }
  return new CertificationCenterMember({
    id: certificationCenterMemberDTO.id,
    certificationCenter,
    user,
    isReferer: certificationCenterMemberDTO.isReferer,
    createdAt: certificationCenterMemberDTO.createdAt,
    updatedByUserId: certificationCenterMemberDTO.updatedByUserId,
    updatedAt: certificationCenterMemberDTO.updatedAt,
    role: certificationCenterMemberDTO.role,
  });
}

const update = async function (certificationCenterMember) {
  const data = _.pick(certificationCenterMember, ['disabledAt', 'isReferer', 'role', 'updatedByUserId', 'updatedAt']);
  await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME).update(data).where({ id: certificationCenterMember.id });
};

const findById = async function (certificationCenterMemberId) {
  const certificationCenterMember = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
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
    .where({ 'certification-center-memberships.id': certificationCenterMemberId })
    .first();

  if (!certificationCenterMember) {
    throw new NotFoundError(`Cannot find a certification center member for id ${certificationCenterMemberId}`);
  }

  return _toDomain(certificationCenterMember);
};

const findActiveByCertificationCenterIdSortedByRole = async function ({ certificationCenterId }) {
  const certificationCenterMembers = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
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
    .orderByRaw("CASE role WHEN 'ADMIN' THEN 1 ELSE 2 END")
    .orderByRaw('LOWER("lastName") asc')
    .orderByRaw('LOWER("firstName") asc');

  return certificationCenterMembers.map(_toDomain);
};

const isAdminOfCertificationCenter = async function ({ userId, certificationCenterId }) {
  const certificationCenterMember = await knex(CERTIFICATION_CENTER_MEMBERSHIP_TABLE_NAME)
    .select('id')
    .where({
      certificationCenterId,
      userId,
      disabledAt: null,
      role: 'ADMIN',
    })
    .first();

  return Boolean(certificationCenterMember);
};

export { findActiveByCertificationCenterIdSortedByRole, findById, isAdminOfCertificationCenter, update };
