import { UserDetailsForAdmin } from '../../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | get-user-details-for-admin', function () {
  describe('#getUserDetailsForAdmin', function () {
    it('returns the found user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });

      // then
      expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(userDetailsForAdmin.id).to.equal(userId);
    });

    context('when no user is found', function () {
      it('throws a UserNotFoundError', async function () {
        // given
        const nonExistentUserId = 678;

        // when & then
        await expect(usecases.getUserDetailsForAdmin({ userId: nonExistentUserId })).to.be.rejectedWith(
          UserNotFoundError,
        );
      });
    });
  });
});
