const { expect, databaseBuilder } = require('../../../test-helper');
const checkUserIsAdminAndManagingStudentsForOrganization = require('../../../../lib/application/usecases/checkUserIsAdminAndManagingStudentsForOrganization');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Integration | API | checkUserIsAdminAndManagingStudentsForOrganization', () => {
  describe('when the user does not belongs to the organization', () => {
    it('returns false', async () => {

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(user.id, organization.id, 'SUP');

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to the organization is admin, the organization manages students and has the correct type', () => {
    it('returns false', async () => {

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id, organizationRole: Membership.roles.ADMIN });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(user.id, organization.id, 'SUP');

      expect(belongsToSupOrganization).to.be.true;
    });
  });

  describe('when the user belongs to the organization but is not admin,', () => {
    it('returns false', async () => {

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id, organizationRole: Membership.roles.MEMBER });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(user.id, organization.id, 'SUP');

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to an organization that is not managing students,', () => {
    it('returns false', async () => {

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: false });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id, organizationRole: Membership.roles.ADMIN });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(user.id, organization.id, 'SUP');

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to an organization that has not the given organization type,', () => {
    it('returns false', async () => {

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id, organizationRole: Membership.roles.ADMIN });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(user.id, organization.id, 'SUP');

      expect(belongsToSupOrganization).to.be.false;
    });
  });
});
