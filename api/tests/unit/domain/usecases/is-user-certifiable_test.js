const { sinon, expect } = require('../../../test-helper');
const isUserCertifiable = require('../../../../lib/domain/usecases/is-user-certifiable');
const CertificationProfile = require('../../../../lib/domain/models/CertificationProfile');

describe('Unit | UseCase | is-user-certifiable', () => {

  let certificationProfileService;
  let clock;
  const now = new Date(2020, 1, 1);
  const certificationProfile = new CertificationProfile();
  const userId = 2;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    certificationProfileService = { getCertificationProfile: sinon.stub().withArgs({ userId, limitDate: now }).resolves(certificationProfile) };
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
    const result = await isUserCertifiable({
      userId,
      certificationProfileService,
    });

    //then
    expect(result).to.be.false;
  });
});
