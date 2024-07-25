import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';
import { CertificationPointOfContact } from '../../domain/read-models/CertificationPointOfContact.js';

const CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME = 'certification-center-memberships';

/**
 * Retrieves allowed certification center accesses for a given list of centers.
 *
 * @param {Array} centerList - List of certification centers.
 * @returns {Promise<Array>} - List of allowed center accesses.
 */
const getAllowedCenterAccesses = async function (centerList) {
  const allowedCenterIdList = centerList.map((center) => center.id);

  const allowedAccessDTOs = await knex
    .select({
      id: 'certification-centers.id',
      externalId: 'certification-centers.externalId',
      type: 'certification-centers.type',
      isRelatedToManagingStudentsOrganization: 'organizations.isManagingStudents',
      tags: knex.raw('array_agg(?? order by ??)', ['tags.name', 'tags.name']),
      habilitations: knex.raw(
        `array_agg(json_build_object(
          'id', "complementary-certifications".id,
          'label', "complementary-certifications".label,
          'key', "complementary-certifications".key,
          'hasComplementaryReferential', "complementary-certifications"."hasComplementaryReferential"
        ) order by "complementary-certifications".id)`,
      ),
    })
    .from('certification-centers')
    .leftJoin('organizations', function () {
      this.on('organizations.externalId', 'certification-centers.externalId').andOn(
        'organizations.type',
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

  return _toDomain({ allowedAccessDTOs, centerList });
};

/**
 * Retrieves authorized certification center IDs for a given user.
 *
 * @param {number} userId - User ID.
 * @returns {Promise<Object>} - Authorized center IDs and user data.
 */
const getAuthorizedCenterIds = async function (userId) {
  const certificationPointOfContactDTO = await knex
    .select({
      id: 'users.id',
      firstName: 'users.firstName',
      lastName: 'users.lastName',
      email: 'users.email',
      lang: 'users.lang',
      pixCertifTermsOfServiceAccepted: 'users.pixCertifTermsOfServiceAccepted',
      certificationCenterIds: knex.raw('array_agg(?? order by ?? asc)', [
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

export { getAllowedCenterAccesses, getAuthorizedCenterIds, getPointOfContact };

function _toDomain({ allowedAccessDTOs, centerList }) {
  return allowedAccessDTOs.map((allowedCenterAccessDTO) => {
    const center = centerList.find((center) => center.id === allowedCenterAccessDTO.id);

    return new AllowedCertificationCenterAccess({
      center: {
        ...center,
        habilitations: _cleanHabilitations(allowedCenterAccessDTO),
      },
      isRelatedToManagingStudentsOrganization: Boolean(allowedCenterAccessDTO.isRelatedToManagingStudentsOrganization),
      relatedOrganizationTags: _cleanTags(allowedCenterAccessDTO),
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
  const certificationCenters = await knex
    .select('certificationCenterId')
    .from('certification-center-memberships')
    .where('certification-center-memberships.userId', certificationPointOfContactDTO.id)
    .whereIn(
      'certification-center-memberships.certificationCenterId',
      certificationPointOfContactDTO.certificationCenterIds,
    )
    .where('certification-center-memberships.disabledAt', null);

  const certificationCenterIds = _.chain(certificationCenters)
    .map((certificationCenter) => certificationCenter.certificationCenterId)
    .compact()
    .value();
  return certificationCenterIds;
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
  return knex(CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME)
    .select('id', 'certificationCenterId', 'userId', 'role')
    .where({
      userId,
      disabledAt: null,
    });
}
