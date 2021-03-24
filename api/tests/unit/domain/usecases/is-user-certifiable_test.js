const { sinon, expect } = require('../../../test-helper');
const isUserCertifiable = require('../../../../lib/domain/usecases/is-user-certifiable');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');

describe('Unit | UseCase | is-user-certifiable', function() {

  let placementProfileService;
  let clock;
  const now = new Date(2020, 1, 1);
  const placementProfile = new PlacementProfile();
  const userId = 2;

  beforeEach(function() {
    clock = sinon.useFakeTimers(now);
    placementProfileService = { getPlacementProfile: sinon.stub().withArgs({ userId, limitDate: now }).resolves(placementProfile) };
  });

  afterEach(function() {
    clock.restore();
    sinon.restore();
  });

  it('should return the user certification profile', async function() {
    // when
    const result = await isUserCertifiable({
      userId,
      placementProfileService,
    });

    //then
    expect(result).to.be.false;
  });
});
