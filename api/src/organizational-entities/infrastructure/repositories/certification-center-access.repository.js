import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';

/**
 * Retrieve a certification center access
 *
 * @param {number} certificationCenterId - List of certification centers.
 * @returns {Promise<AllowedCertificationCenterAccess>} - center access
 */
export const getCertificationCenterAccess = async ({ certificationCenterId }) => {
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

function _transformScoBlockedAccessDates(scoBlockedAccessDatesRows) {
  return {
    college: scoBlockedAccessDatesRows.find((row) => row.scoOrganizationTagName === 'COLLEGE')?.reopeningDate,
    lycee: scoBlockedAccessDatesRows.find((row) => row.scoOrganizationTagName === 'LYCEE')?.reopeningDate,
  };
}
