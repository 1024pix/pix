import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import { OrganizationLearner } from '../../../../../../src/shared/domain/models/OrganizationLearner.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | organization-learner-repository', function () {
  describe('#findOneByUserIdAndOrganizationId', function () {
    let userId;
    let organizationId;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
      return databaseBuilder.commit();
    });

    it('should return instance of OrganizationLearner linked to the given userId and organizationId', async function () {
      // when
      const organizationLearner = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId,
      });

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
      expect(organizationLearner.userId).to.equal(userId);
    });

    it('should return null if there is no organizationLearner linked to the given userId', async function () {
      // given
      const otherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId: otherUserId,
        organizationId,
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return null if there is no organizationLearner linked to the given organizationId', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId: otherOrganizationId,
      });

      // then
      expect(result).to.equal(null);
    });
  });
});
