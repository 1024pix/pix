const { knex } = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const CertificationPointOfContact = require('../../domain/read-models/CertificationPointOfContact');

module.exports = {
  async get(userId) {
    const result = await knex
      .select({
        id: 'users.id',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        email: 'users.email',
        pixCertifTermsOfServiceAccepted: 'users.pixCertifTermsOfServiceAccepted',
        certificationCenterId: 'certification-centers.id',
        certificationCenterName: 'certification-centers.name',
        certificationCenterType: 'certification-centers.type',
        certificationCenterExternalId: 'certification-centers.externalId',
        isRelatedOrganizationManagingStudents: 'organizations.isManagingStudents',
      })
      .from('users')
      .join('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
      .join('certification-centers', 'certification-centers.id', 'certification-center-memberships.certificationCenterId')
      .leftJoin('organizations', 'organizations.externalId', 'certification-centers.externalId')
      .where('users.id', userId)
      .first();

    if (!result) {
      throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
    }

    return new CertificationPointOfContact(result);
  },
};
