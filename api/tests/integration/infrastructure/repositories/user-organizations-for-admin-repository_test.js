import { expect, databaseBuilder } from '../../../test-helper';
import UserOrganizationForAdmin from '../../../../lib/domain/read-models/UserOrganizationForAdmin';
import userOrganizationsForAdminRepository from '../../../../lib/infrastructure/repositories/user-organizations-for-admin-repository';

describe('Integration | Repository | user-organizations-for-admin', function () {
  context('#findByUserId', function () {
    context('When user doesn’t exist', function () {
      it('should return an empty list', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;

        const organization1 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 1',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization1.id,
          userId,
          organizationRole: 'MEMBER',
        });

        await databaseBuilder.commit();

        // when
        const nonExistentOrDeletedUserId = 999999;
        const userOrganizations = await userOrganizationsForAdminRepository.findByUserId(nonExistentOrDeletedUserId);

        // then
        expect(userOrganizations).to.be.an('array').that.is.empty;
      });
    });

    context('When user isn’t member of any organization', function () {
      it('should return an empty list', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;

        const organization1 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 1',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization1.id,
          userId,
          organizationRole: 'MEMBER',
        });

        const user = databaseBuilder.factory.buildUser({ firstName: 'Otto', lastName: 'KARR' });

        await databaseBuilder.commit();

        // when
        const userOrganizations = await userOrganizationsForAdminRepository.findByUserId(user.id);

        // then
        expect(userOrganizations).to.be.an('array').that.is.empty;
      });
    });

    context('When user is member of some organizations', function () {
      it('should return a list with the organizations the user is member of', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ firstName: 'Otto', lastName: 'KARR' });
        const anotherUser = databaseBuilder.factory.buildUser({ firstName: 'Corinne', lastName: 'TITEGOUTTE' });

        const organization1 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 1',
        });
        const organization2 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 2',
        });
        const organization3 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 3',
        });
        const organization4 = databaseBuilder.factory.buildOrganization({
          name: 'Organization 4',
        });

        databaseBuilder.factory.buildMembership({
          organizationId: organization1.id,
          userId: user.id,
          organizationRole: 'MEMBER',
          disabledAt: '2001-01-01',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization2.id,
          userId: user.id,
          organizationRole: 'MEMBER',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization3.id,
          userId: user.id,
          organizationRole: 'ADMIN',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization4.id,
          userId: anotherUser.id,
          organizationRole: 'MEMBER',
        });

        await databaseBuilder.commit();

        // when
        const userOrganizations = await userOrganizationsForAdminRepository.findByUserId(user.id);

        // then
        expect(userOrganizations).to.be.an('array').to.have.lengthOf(2);

        expect(userOrganizations[0])
          .to.be.instanceOf(UserOrganizationForAdmin)
          .to.has.all.keys(
            'id',
            'updatedAt',
            'organizationRole',
            'organizationId',
            'organizationName',
            'organizationType',
            'organizationExternalId'
          );
        expect(userOrganizations[0].organizationName).be.oneOf(['Organization 2', 'Organization 3']);

        expect(userOrganizations[1])
          .to.be.instanceOf(UserOrganizationForAdmin)
          .to.has.all.keys(
            'id',
            'updatedAt',
            'organizationRole',
            'organizationId',
            'organizationName',
            'organizationType',
            'organizationExternalId'
          );
        expect(userOrganizations[1].organizationName).be.oneOf(['Organization 2', 'Organization 3']);
      });
    });
  });
});
