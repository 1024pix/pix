import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { CERTIFICATION_FEATURES } from '../../../src/certification/shared/domain/constants.js';
import { NotFoundError } from '../../domain/errors.js';
import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';
import { CertificationPointOfContact } from '../../domain/read-models/CertificationPointOfContact.js';

const CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME = 'certification-center-memberships';

const get = async function (userId) {
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

  const authorizedCertificationCenterIds = await _removeDisabledCertificationCenterAccesses({
    certificationPointOfContactDTO,
  });
  const allowedCertificationCenterAccesses = await _findAllowedCertificationCenterAccesses(
    authorizedCertificationCenterIds,
  );

  const certificationCenterMemberships = await _findNotDisabledCertificationCenterMemberships(userId);

  return new CertificationPointOfContact({
    ...certificationPointOfContactDTO,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
  });
};

export { get };

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

async function _findAllowedCertificationCenterAccesses(certificationCenterIds) {
  const allowedCertificationCenterAccessDTOs = await knex
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
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
      isV3Pilot: 'certification-centers.isV3Pilot',
      isComplementaryAlonePilot: knex.raw(
        'CASE WHEN count("complementaryCertificationAloneFeature"."certificationCenterId") > 0 THEN TRUE ELSE FALSE END',
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
    .leftJoin(
      function () {
        this.select('certificationCenterId')
          .from('certification-center-features')
          .innerJoin('features', function () {
            this.on('certification-center-features.featureId', 'features.id').andOnVal(
              'features.key',
              CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
            );
          })
          .as('complementaryCertificationAloneFeature');
      },
      'complementaryCertificationAloneFeature.certificationCenterId',
      'certification-centers.id',
    )
    .whereIn('certification-centers.id', certificationCenterIds)
    .orderBy('certification-centers.id')
    .groupBy('certification-centers.id', 'organizations.isManagingStudents');

  return _.map(allowedCertificationCenterAccessDTOs, (allowedCertificationCenterAccessDTO) => {
    return new AllowedCertificationCenterAccess({
      ...allowedCertificationCenterAccessDTO,
      isRelatedToManagingStudentsOrganization: Boolean(
        allowedCertificationCenterAccessDTO.isRelatedToManagingStudentsOrganization,
      ),
      relatedOrganizationTags: _cleanTags(allowedCertificationCenterAccessDTO),
      // toDomain a créer avec le modèle complementaryCertification
      habilitations: _cleanHabilitations(allowedCertificationCenterAccessDTO),
    });
  });

  function _cleanTags(allowedCertificationCenterAccessDTO) {
    return _(allowedCertificationCenterAccessDTO.tags).compact().uniq().value();
  }

  function _cleanHabilitations(allowedCertificationCenterAccessDTO) {
    return _(allowedCertificationCenterAccessDTO.habilitations)
      .filter((habilitation) => Boolean(habilitation.id))
      .uniqBy('id')
      .value();
  }
}

async function _findNotDisabledCertificationCenterMemberships(userId) {
  return knex(CERTIFICATION_CENTER_MEMBERSHIPS_TABLE_NAME)
    .select('id', 'certificationCenterId', 'userId', 'role')
    .where({
      userId,
      disabledAt: null,
    });
}
