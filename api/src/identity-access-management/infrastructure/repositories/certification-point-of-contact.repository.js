import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';
import { CertificationPointOfContact } from '../../domain/read-models/CertificationPointOfContact.js';

const CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME = 'certification-center-memberships';

/**
 * Retrieve a certification center access
 *
 * @param {number} certificationCenterId - List of certification centers.
 * @returns {Promise<AllowedCertificationCenterAccess>} - center access
 */
const getCertificationCenterAccess = async ({ certificationCenterId }) => {
  const knexConn = DomainTransaction.getConnection();

  const certificationCenterAccess = await knexConn
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      externalId: 'certification-centers.externalId',
      type: 'certification-centers.type',
      isInWhitelist: 'certification-centers.isScoBlockedAccessWhitelist',
      isRelatedToManagingStudentsOrganization: 'organizations.isManagingStudents',
      tags: knexConn.raw('array_agg(?? order by ??)', ['tags.name', 'tags.name']),
      habilitations: knexConn.raw(
        `array_agg(json_build_object(
          'id', "complementary-certifications".id,
          'label', "complementary-certifications".label,
          'key', "complementary-certifications".key
        ) order by "complementary-certifications".id)`,
      ),
    })
    .from('certification-centers')
    .leftJoin('organizations', function () {
      this.on(knexConn.raw('LOWER("organizations"."externalId") = LOWER("certification-centers"."externalId")')).andOn(
        'organizations.type',
        '=',
        'certification-centers.type',
      );
    })
    .leftJoin('organization-tags', 'organization-tags.organizationId', 'organizations.id')
    .leftJoin('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.certificationCenterId',
      'certification-centers.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-habilitations.complementaryCertificationId',
    )
    .where('certification-centers.id', certificationCenterId)
    .groupBy('certification-centers.id', 'organizations.isManagingStudents')
    .first();

  const scoBlockedAccessDatesRows = await knexConn('certification_sco_blocked_access_dates').select(
    'scoOrganizationTagName',
    'reopeningDate',
  );
  const scoBlockedAccessDates = _transformScoBlockedAccessDates(scoBlockedAccessDatesRows);

  return _toDomain({ certificationCenterAccess, scoBlockedAccessDates });
};

const _toDomain = ({ certificationCenterAccess, scoBlockedAccessDates }) => {
  return new AllowedCertificationCenterAccess({
    center: {
      id: certificationCenterAccess.id,
      name: certificationCenterAccess.name,
      externalId: certificationCenterAccess.externalId,
      type: certificationCenterAccess.type,
      isInWhitelist: certificationCenterAccess.isInWhitelist,
      habilitations: _cleanHabilitations(certificationCenterAccess),
    },
    isRelatedToManagingStudentsOrganization: certificationCenterAccess.isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags: _cleanTags(certificationCenterAccess),
    scoBlockedAccessDateCollege: scoBlockedAccessDates.college,
    scoBlockedAccessDateLycee: scoBlockedAccessDates.lycee,
  });
};

/**
 * Retrieves allowed certification center accesses for a given list of centers.
 *
 * @param {Array} centerList - List of certification centers.
 * @returns {Promise<Array>} - List of allowed center accesses.
 */
const getAllowedCenterAccesses = async function ({ centerList }) {
  const allowedCenterIdList = centerList.map((center) => center.id);

  const knexConn = DomainTransaction.getConnection();

  const allowedAccessDTOs = await knexConn
    .select({
      id: 'certification-centers.id',
      externalId: 'certification-centers.externalId',
      type: 'certification-centers.type',
      isInWhitelist: 'certification-centers.isScoBlockedAccessWhitelist',
      isRelatedToManagingStudentsOrganization: 'organizations.isManagingStudents',
      tags: knexConn.raw('array_agg(?? order by ??)', ['tags.name', 'tags.name']),
      habilitations: knexConn.raw(
        `array_agg(json_build_object(
          'id', "complementary-certifications".id,
          'label', "complementary-certifications".label,
          'key', "complementary-certifications".key
        ) order by "complementary-certifications".id)`,
      ),
    })
    .from('certification-centers')
    .leftJoin('organizations', function () {
      this.on(knexConn.raw('LOWER("organizations"."externalId") = LOWER("certification-centers"."externalId")')).andOn(
        'organizations.type',
        '=',
        'certification-centers.type',
      );
    })
    .leftJoin('organization-tags', 'organization-tags.organizationId', 'organizations.id')
    .leftJoin('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.certificationCenterId',
      'certification-centers.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-habilitations.complementaryCertificationId',
    )
    .whereIn('certification-centers.id', allowedCenterIdList)
    .orderBy('certification-centers.id')
    .groupBy('certification-centers.id', 'organizations.isManagingStudents');

  const scoBlockedAccessDatesRows = await knexConn('certification_sco_blocked_access_dates').select(
    'scoOrganizationTagName',
    'reopeningDate',
  );
  const scoBlockedAccessDates = _transformScoBlockedAccessDates(scoBlockedAccessDatesRows);

  return _toDomainList({ allowedAccessDTOs, centerList, scoBlockedAccessDates });
};

/**
 * Retrieves authorized certification center IDs for a given user.
 *
 * @param {number} userId - User ID.
 * @returns {Promise<Object>} - Authorized center IDs and user data.
 */
const getAuthorizedCenterIds = async function (userId) {
  const knexConn = DomainTransaction.getConnection();

  const certificationPointOfContactDTO = await knexConn
    .select({
      id: 'users.id',
      firstName: 'users.firstName',
      lastName: 'users.lastName',
      email: 'users.email',
      lang: 'users.lang',
      pixCertifTermsOfServiceAccepted: 'users.pixCertifTermsOfServiceAccepted',
      certificationCenterIds: knexConn.raw('array_agg(?? order by ?? asc)', [
        'certificationCenterId',
        'certificationCenterId',
      ]),
    })
    .from('users')
    .leftJoin('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
    .where('users.id', userId)
    .groupBy('users.id')
    .first();

  if (!certificationPointOfContactDTO) {
    throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
  }

  return {
    authorizedCenterIds: await _removeDisabledCertificationCenterAccesses({
      certificationPointOfContactDTO,
    }),
    certificationPointOfContactDTO,
  };
};

/**
 * Retrieves the point of contact details for a given user.
 *
 * @param {Object} params - Parameters containing user ID, certification point of contact DTO, and allowed certification center accesses.
 * @returns {Promise<Object>} - Certification point of contact details.
 */
const getPointOfContact = async function ({
  userId,
  certificationPointOfContactDTO,
  allowedCertificationCenterAccesses,
}) {
  const certificationCenterMemberships = await _findNotDisabledCertificationCenterMemberships(userId);

  return new CertificationPointOfContact({
    ...certificationPointOfContactDTO,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
  });
};

export { getAllowedCenterAccesses, getAuthorizedCenterIds, getCertificationCenterAccess, getPointOfContact };

function _toDomainList({ allowedAccessDTOs, centerList, scoBlockedAccessDates }) {
  return allowedAccessDTOs.map((allowedCenterAccessDTO) => {
    const center = centerList.find((center) => center.id === allowedCenterAccessDTO.id);

    return new AllowedCertificationCenterAccess({
      center: {
        ...center,
        isInWhitelist: allowedCenterAccessDTO.isInWhitelist,
        habilitations: _cleanHabilitations(allowedCenterAccessDTO),
      },
      isRelatedToManagingStudentsOrganization: Boolean(allowedCenterAccessDTO.isRelatedToManagingStudentsOrganization),
      relatedOrganizationTags: _cleanTags(allowedCenterAccessDTO),
      scoBlockedAccessDateCollege: scoBlockedAccessDates.college,
      scoBlockedAccessDateLycee: scoBlockedAccessDates.lycee,
    });
  });
}

/**
 * Filters out disabled certification center accesses.
 *
 * @param {Object} certificationPointOfContactDTO - Certification point of contact DTO.
 * @returns {Promise<Array>} - List of active certification center IDs.
 */
async function _removeDisabledCertificationCenterAccesses({ certificationPointOfContactDTO }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCenters = await knexConn
    .select('certificationCenterId')
    .from('certification-center-memberships')
    .where('certification-center-memberships.userId', certificationPointOfContactDTO.id)
    .whereIn(
      'certification-center-memberships.certificationCenterId',
      certificationPointOfContactDTO.certificationCenterIds,
    )
    .where('certification-center-memberships.disabledAt', null);

  return _.chain(certificationCenters)
    .map((certificationCenter) => certificationCenter.certificationCenterId)
    .compact()
    .value();
}

/**
 * Cleans and removes duplicate tags from the DTO.
 *
 * @param {Object} allowedCertificationCenterAccessDTO - Allowed certification center access DTO.
 * @returns {Array} - Cleaned and unique tags.
 */
function _cleanTags(allowedCertificationCenterAccessDTO) {
  return _(allowedCertificationCenterAccessDTO.tags).compact().uniq().value();
}

/**
 * Cleans and removes duplicate habilitations from the DTO.
 *
 * @param {Object} allowedCertificationCenterAccessDTO - Allowed certification center access DTO.
 * @returns {Array} - Cleaned and unique habilitations.
 */
function _cleanHabilitations(allowedCertificationCenterAccessDTO) {
  return _(allowedCertificationCenterAccessDTO.habilitations)
    .filter((habilitation) => habilitation.id > 0)
    .uniqBy('id')
    .value();
}

/**
 * Retrieves active (non-disabled) certification center memberships for a given user.
 *
 * @param {number} userId - User ID.
 * @returns {Promise<Array>} - List of active certification center memberships.
 */
async function _findNotDisabledCertificationCenterMemberships(userId) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn(CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME)
    .select('id', 'certificationCenterId', 'userId', 'role')
    .where({
      userId,
      disabledAt: null,
    });
}

function _transformScoBlockedAccessDates(scoBlockedAccessDatesRows) {
  return {
    college: scoBlockedAccessDatesRows.find((row) => row.scoOrganizationTagName === 'COLLEGE')?.reopeningDate,
    lycee: scoBlockedAccessDatesRows.find((row) => row.scoOrganizationTagName === 'LYCEE')?.reopeningDate,
  };
}
