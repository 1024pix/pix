const _ = require('lodash');
const { knex } = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const CertificationPointOfContact = require('../../domain/read-models/CertificationPointOfContact');
const AllowedCertificationCenterAccess = require('../../domain/read-models/AllowedCertificationCenterAccess');

module.exports = {

  async get(userId) {
    const certificationPointOfContactDTO = await knex
      .select({
        id: 'users.id',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        email: 'users.email',
        pixCertifTermsOfServiceAccepted: 'users.pixCertifTermsOfServiceAccepted',
        certificationCenterIds: (knex.raw('array_agg(??)', 'certification-center-memberships.certificationCenterId')),
      })
      .from('users')
      .join('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
      .where('users.id', userId)
      .groupByRaw('1, 2, 3, 4, 5')
      .first();

    if (!certificationPointOfContactDTO) {
      throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
    }

    const certificationCenterIds = _.compact(certificationPointOfContactDTO.certificationCenterIds);
    const allowedCertificationCenterAccesses = await _findAllowedCertificationCenterAccesses(certificationCenterIds);

    return new CertificationPointOfContact({
      ...certificationPointOfContactDTO,
      allowedCertificationCenterAccesses,
    });
  },
};

async function _findAllowedCertificationCenterAccesses(certificationCenterIds) {
  const allowedCertificationCenterAccessDTOs = await knex
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      externalId: 'certification-centers.externalId',
      type: 'certification-centers.type',
      isRelatedToManagingStudentsOrganization: 'organizations.isManagingStudents',
      tags: (knex.raw('array_agg(?? order by ??)', ['tags.name', 'tags.name'])),
    })
    .from('certification-centers')
    .leftJoin('organizations', 'organizations.externalId', 'certification-centers.externalId')
    .leftJoin('organization-tags', 'organization-tags.organizationId', 'organizations.id')
    .leftJoin('tags', 'tags.id', 'organization-tags.tagId')
    .whereIn('certification-centers.id', certificationCenterIds)
    .orderBy('certification-centers.id')
    .groupByRaw('1, 2, 3, 4, 5');

  return _.map(allowedCertificationCenterAccessDTOs, (allowedCertificationCenterAccessDTO) => {
    const tags = _.compact(allowedCertificationCenterAccessDTO.tags);
    return new AllowedCertificationCenterAccess({
      ...allowedCertificationCenterAccessDTO,
      isRelatedToManagingStudentsOrganization: Boolean(allowedCertificationCenterAccessDTO.isRelatedToManagingStudentsOrganization),
      relatedOrganizationTags: tags,
    });
  });
}

