import { OrganizationDoesHaveFeatureEnabledError } from '../../../../../src/prescription/learner-management/domain/errors.js';
import * as checkOrganizationDoesNotHaveFeatureUseCase from '../../../../../src/shared/application/usecases/checkOrganizationDoesNotHaveFeature.js';
import { catchErr, expect, sinon } from '../../../../../tests/test-helper.js';

describe('Unit | Application | Validator | checkOrganizationHasFeature', function () {
  context('When organization does not have the feature enabled', function () {
    it('should not throw', async function () {
      // given
      const organizationId = 'organizationId';
      const featureKey = 'featureKey';
      const organizationFeatureRepositoryStub = {
        isFeatureEnabledForOrganization: sinon.stub(),
      };

      organizationFeatureRepositoryStub.isFeatureEnabledForOrganization
        .withArgs({ organizationId, featureKey })
        .resolves(false);

      // when & then
      expect(
        async () =>
          await checkOrganizationDoesNotHaveFeatureUseCase.execute({
            organizationId,
            featureKey,
            dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
          }),
      ).to.not.throw();
    });
  });

  context('When organization has the feature enabled', function () {
    it('should throw', async function () {
      // given
      const organizationId = 'organizationId';
      const featureKey = 'featureKey';
      const organizationFeatureRepositoryStub = {
        isFeatureEnabledForOrganization: sinon.stub(),
      };

      organizationFeatureRepositoryStub.isFeatureEnabledForOrganization
        .withArgs({ organizationId, featureKey })
        .resolves(true);

      // when
      const response = await catchErr(checkOrganizationDoesNotHaveFeatureUseCase.execute)({
        organizationId,
        featureKey,
        dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
      });

      // then
      expect(response).to.be.an.instanceOf(OrganizationDoesHaveFeatureEnabledError);
    });
  });
});
