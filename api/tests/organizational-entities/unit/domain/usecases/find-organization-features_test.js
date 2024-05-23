import { findOrganizationFeatures } from '../../../../../src/organizational-entities/domain/usecases/find-organization-features.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | UseCases | find-organization-features', function () {
  let organizationFeatureRepository;

  beforeEach(function () {
    organizationFeatureRepository = {
      findAllOrganizationFeaturesFromOrganizationId: sinon.stub(),
    };
  });

  it('should call findAllOrganizationFeaturesFromOrganizationId with correct paramaters', async function () {
    // given
    const organizationId = Symbol('organizationId');

    // when
    await findOrganizationFeatures({ organizationId, organizationFeatureRepository });

    // then
    expect(
      organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId,
    ).to.have.been.calledOnceWithExactly({
      organizationId,
    });
  });
});
