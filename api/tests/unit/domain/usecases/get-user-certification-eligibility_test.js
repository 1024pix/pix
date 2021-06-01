const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');

describe('Unit | UseCase | get-user-certification-eligibility', () => {

  let clock;
  const now = new Date(2020, 1, 1);

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it('should return the user certification profile', async () => {
    // given
    const placementProfile = {
      isCertifiable: () => true,
    };
    const placementProfileService = { getPlacementProfile: sinon.stub() };
    placementProfileService.getPlacementProfile
      .withArgs({ userId: 2, limitDate: now })
      .resolves(placementProfile);

    // when
    const certificationEligibility = await getUserCertificationEligibility({
      userId: 2,
      placementProfileService,
    });

    // then
    const expectedCertificationEligibility = domainBuilder.buildCertificationEligibility({
      id: 2,
      pixCertificationEligible: true,
    });
    expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
  });
});
