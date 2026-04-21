import sinon from 'sinon';

import * as checkOrganizationDoesNotHaveFeatureUseCase from '../../../../../src/shared/application/usecases/checkOrganizationDoesNotHaveFeature.js';

describe('Unit | Application | Use Case | checkOrganizationDoesNotHaveFeature', function () {
  context('When organization does not have the feature enabled', function () {
    it('should return true', async function () {
      // given
      const organizationId = 'organizationId';
      const featureKey = 'featureKey';
      const organizationFeatureRepositoryStub = {
        isFeatureEnabledForOrganization: sinon.stub(),
      };

      organizationFeatureRepositoryStub.isFeatureEnabledForOrganization
        .withArgs({ organizationId, featureKey })
        .resolves(false);

      // when
      const response = await checkOrganizationDoesNotHaveFeatureUseCase.execute({
        organizationId,
        featureKey,
        dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
      });

      // then
      expect(response).to.be.true;
    });
  });

  context('When organization has the feature enabled', function () {
    it('should return false', async function () {
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
      const response = await checkOrganizationDoesNotHaveFeatureUseCase.execute({
        organizationId,
        featureKey,
        dependencies: { organizationFeatureRepository: organizationFeatureRepositoryStub },
      });

      // then
      expect(response).to.be.false;
    });
  });
});
