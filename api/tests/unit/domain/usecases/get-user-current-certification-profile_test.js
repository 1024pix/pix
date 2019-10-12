const { sinon, expect } = require('../../../test-helper');
const getUserCurrentCertificationProfile = require('../../../../lib/domain/usecases/get-user-current-certification-profile');

describe('Unit | UseCase | get-user-current-certification-profile', () => {

  let userService;

  beforeEach(() => {
    userService = { getCertificationProfile: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return the user certification profile', async () => {
    // given
    const userId = 2;

    userService.getCertificationProfile.resolves('certificationProfile');

    // when
    const actualCertificationProfile = await getUserCurrentCertificationProfile({
      userId,
      userService,
    });

    //then
    expect(actualCertificationProfile).to.deep.equal('certificationProfile');
  });
});
