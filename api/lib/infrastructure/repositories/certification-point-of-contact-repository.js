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
        // eslint-disable-next-line no-restricted-syntax
        certificationCenters: knex.raw(`JSON_AGG(JSON_BUILD_OBJECT(
          'id', "certification-centers"."id",
          'name', "certification-centers"."name",
          'type', "certification-centers"."type",
          'externalId', "certification-centers"."externalId",
          'isRelatedOrganizationManagingStudents', "organizations"."isManagingStudents"
        ) ORDER BY "certification-center-memberships"."createdAt" DESC)`),
      })
      .from('users')
      .join('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
      .join('certification-centers', 'certification-centers.id', 'certification-center-memberships.certificationCenterId')
      .leftJoin('organizations', 'organizations.externalId', 'certification-centers.externalId')
      .where('users.id', userId)
      .groupBy('users.id')
      .first();

    if (!result) {
      throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
    }

    return new CertificationPointOfContact(result);
  },
};
