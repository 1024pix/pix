import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import { NotFoundError } from '../../domain/errors';
import CertificationPointOfContact from '../../domain/read-models/CertificationPointOfContact';
import AllowedCertificationCenterAccess from '../../domain/read-models/AllowedCertificationCenterAccess';

export default {
  async get(userId) {
    const certificationPointOfContactDTO = await knex
      .select({
        id: 'users.id',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        email: 'users.email',
        pixCertifTermsOfServiceAccepted: 'users.pixCertifTermsOfServiceAccepted',
        certificationCenterIds: knex.raw('array_agg(?? order by ?? asc)', [
          'certificationCenterId',
          'certificationCenterId',
        ]),
      })
      .from('users')
      .leftJoin('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
      .where('users.id', userId)
      .groupByRaw('1, 2, 3, 4, 5')
      .first();

    if (!certificationPointOfContactDTO) {
      throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
    }

    const authorizedCertificationCenterIds = await _removeDisabledCertificationCenterAccesses({
      certificationPointOfContactDTO,
    });
    const allowedCertificationCenterAccesses = await _findAllowedCertificationCenterAccesses(
      authorizedCertificationCenterIds
    );

    return new CertificationPointOfContact({
      ...certificationPointOfContactDTO,
      allowedCertificationCenterAccesses,
    });
  },
};

async function _removeDisabledCertificationCenterAccesses({ certificationPointOfContactDTO }) {
  const certificationCenters = await knex
    .select('certificationCenterId')
    .from('certification-center-memberships')
    .where('certification-center-memberships.userId', certificationPointOfContactDTO.id)
    .whereIn(
      'certification-center-memberships.certificationCenterId',
      certificationPointOfContactDTO.certificationCenterIds
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
        `array_agg(json_build_object('id', "complementary-certifications".id, 'label', "complementary-certifications".label, 'key', "complementary-certifications".key) order by "complementary-certifications".id)`
      ),
    })
    .from('certification-centers')
    .leftJoin('organizations', function () {
      this.on('organizations.externalId', 'certification-centers.externalId').andOn(
        'organizations.type',
        'certification-centers.type'
      );
    })
    .leftJoin('organization-tags', 'organization-tags.organizationId', 'organizations.id')
    .leftJoin('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.certificationCenterId',
      'certification-centers.id'
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-habilitations.complementaryCertificationId'
    )
    .whereIn('certification-centers.id', certificationCenterIds)
    .orderBy('certification-centers.id')
    .groupByRaw('1, 2, 3, 4, 5');

  return _.map(allowedCertificationCenterAccessDTOs, (allowedCertificationCenterAccessDTO) => {
    return new AllowedCertificationCenterAccess({
      ...allowedCertificationCenterAccessDTO,
      isRelatedToManagingStudentsOrganization: Boolean(
        allowedCertificationCenterAccessDTO.isRelatedToManagingStudentsOrganization
      ),
      relatedOrganizationTags: _cleanTags(allowedCertificationCenterAccessDTO),
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
