import { expect, databaseBuilder } from '../../../test-helper';
import checkUserIsAdminAndManagingStudentsForOrganization from '../../../../lib/application/usecases/checkUserIsAdminAndManagingStudentsForOrganization';
import Membership from '../../../../lib/domain/models/Membership';

describe('Integration | API | checkUserIsAdminAndManagingStudentsForOrganization', function () {
  describe('when the user does not belongs to the organization', function () {
    it('returns false', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(
        user.id,
        organization.id,
        'SUP'
      );

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to the organization is admin, the organization manages students and has the correct type', function () {
    it('returns false', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(
        user.id,
        organization.id,
        'SUP'
      );

      expect(belongsToSupOrganization).to.be.true;
    });
  });

  describe('when the user belongs to the organization but is not admin,', function () {
    it('returns false', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(
        user.id,
        organization.id,
        'SUP'
      );

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to an organization that is not managing students,', function () {
    it('returns false', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: false });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(
        user.id,
        organization.id,
        'SUP'
      );

      expect(belongsToSupOrganization).to.be.false;
    });
  });

  describe('when the user belongs to an organization that has not the given organization type,', function () {
    it('returns false', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();

      const belongsToSupOrganization = await checkUserIsAdminAndManagingStudentsForOrganization.execute(
        user.id,
        organization.id,
        'SUP'
      );

      expect(belongsToSupOrganization).to.be.false;
    });
  });
});
