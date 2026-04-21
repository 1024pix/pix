import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Learner Management | UseCase | has-been-learner', function () {
  let userId;

  beforeEach(async function () {
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    userId = databaseBuilder.factory.buildUser().id;
    const otherUserId = databaseBuilder.factory.buildUser().id;

    databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
    databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: otherUserId });
    databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId, userId });

    await databaseBuilder.commit();
  });

  context('when organization learner exist for given userId', function () {
    it('should return true', async function () {
      // when
      const result = await usecases.hasBeenLearner({ userId });

      // then
      expect(result).to.be.true;
    });
  });

  context('when no organization learner exist for given userId', function () {
    it('should return false', async function () {
      // given
      const notExistingUserId = 0;

      // when
      const result = await usecases.hasBeenLearner({ userId: notExistingUserId });

      // then
      expect(result).to.be.false;
    });
  });
});
