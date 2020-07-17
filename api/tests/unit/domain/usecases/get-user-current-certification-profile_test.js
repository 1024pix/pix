const { sinon, expect } = require('../../../test-helper');
const getUserCurrentCertificationProfile = require('../../../../lib/domain/usecases/get-user-current-certification-profile');

describe('Unit | UseCase | get-user-current-certification-profile', () => {

  let certificationProfileService;
  let clock;
  const now = new Date(2020, 1, 1);

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    certificationProfileService = { getCertificationProfile: sinon.stub() };
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it('should return the user certification profile', async () => {
    // given
    const userId = 2;

    certificationProfileService.getCertificationProfile.withArgs({ userId, limitDate: now }).resolves('certificationProfile');

    // when
    const actualCertificationProfile = await getUserCurrentCertificationProfile({
      userId,
      certificationProfileService,
    });

    //then
    expect(actualCertificationProfile).to.deep.equal('certificationProfile');
  });
});
