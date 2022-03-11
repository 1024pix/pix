const { expect, databaseBuilder, knex } = require('../../../test-helper');
const {
  dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport,
} = require('../../../../scripts/prod/dissociate-user-from-created-schooling-registrations-for-organizations-with-import');

describe('dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport', function () {
  describe('when the organizations manages students and the registration has no birthdate', function () {
    it('dissociate the the user from the schooling registration', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;

      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildSchoolingRegistration({ birthdate: '2000-01-01', userId: userId1, organizationId });
      databaseBuilder.factory.buildSchoolingRegistration({ birthdate: null, userId: userId2, organizationId });

      await databaseBuilder.commit();

      await dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport();

      const result = await knex('schooling-registrations').select('userId').whereNotNull('userId').pluck('userId');

      expect(result).deep.equal([userId1]);
    });
  });

  describe('when the organizations does not manage students and the registration has no birthdate', function () {
    it('does not dissociate the the user from the schooling registration', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: false }).id;

      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildSchoolingRegistration({ birthdate: '2000-01-01', userId: userId1, organizationId });
      databaseBuilder.factory.buildSchoolingRegistration({ birthdate: null, userId: userId2, organizationId });

      await databaseBuilder.commit();

      await dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport();

      const result = await knex('schooling-registrations').select('userId').where({ organizationId }).pluck('userId');

      expect(result).deep.equal([userId1, userId2]);
    });
  });
});
