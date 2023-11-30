import { catchErr, expect, sinon } from '../../../../../tests/test-helper.js';
import * as checkOrganizationHasFeatureUseCase from '../../../../../src/shared/application/usecases/checkOrganizationHasFeature.js';
import { OrganizationDoesNotHaveFeatureEnabledError } from '../../../../../src/prescription/learner-management/domain/errors.js';

describe('Unit | Application | Validator | checkOrganizationHasFeature', function () {
  context('When organization has feature enabled', function () {
    it('should not throw', async function () {
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
      const response = await checkOrganizationHasFeatureUseCase.execute({
        organizationId,
        featureKey,
        dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
      });

      // then
      expect(response).to.not.throw;
    });
  });
  context('When organization does not have feature enabled', function () {
    it('should throw', async function () {
      // given
      const organizationId = 'organizationId';
      const featureKey = 'featureKey';
      const organizationFeatureRepositoryStub = {
        isFeatureEnabledForOrganization: sinon.stub(),
      };

      organizationFeatureRepositoryStub.isFeatureEnabledForOrganization
        .withArgs({ organizationId, featureKey })
        .returns(false);

      // when
      const response = await catchErr(checkOrganizationHasFeatureUseCase.execute)({
        organizationId,
        featureKey,
        dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
      });

      // then
      expect(response).to.throw;
      expect(response).to.be.an.instanceOf(OrganizationDoesNotHaveFeatureEnabledError);
    });
  });
});
