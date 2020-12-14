const { knex } = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const CertificationPointOfContact = require('../../domain/read-models/CertificationPointOfContact');

module.exports = {
  async get(userId) {
    const result = await knex
      .select(
        'users.id as id',
        'users.firstName as firstName',
        'users.lastName as lastName',
        'users.email as email',
        'users.pixCertifTermsOfServiceAccepted as pixCertifTermsOfServiceAccepted',
        'certification-centers.id as certificationCenterId',
        'certification-centers.name as certificationCenterName',
        'certification-centers.type as certificationCenterType',
        'certification-centers.externalId as certificationCenterExternalId',
      )
      .from('users')
      .join('certification-center-memberships', 'certification-center-memberships.userId', 'users.id')
      .join('certification-centers', 'certification-centers.id', 'certification-center-memberships.certificationCenterId')
      .where('users.id', userId)
      .first();

    if (!result) {
      throw new NotFoundError(`Le référent de certification ${userId} n'existe pas.`);
    }

    return new CertificationPointOfContact(result);
  },
};
