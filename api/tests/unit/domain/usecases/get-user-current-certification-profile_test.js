const { sinon, expect } = require('../../../test-helper');
const getUserCurrentCertificationProfile = require('../../../../lib/domain/usecases/get-user-current-certification-profile');

describe('Unit | UseCase | get-user-current-certification-profile', () => {

  let userService;
  let competenceRepository;
  let clock;
  const now = new Date(2020, 1, 1);
  const competences = [{ id: 'rec1' }, { id: 'rec2' }];

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    userService = { getCertificationProfile: sinon.stub() };
    competenceRepository = { listPixCompetencesOnly: sinon.stub().resolves(competences) };
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it('should return the user certification profile', async () => {
    // given
    const userId = 2;

    userService.getCertificationProfile.withArgs({ userId, limitDate: now, competences }).resolves('certificationProfile');

    // when
    const actualCertificationProfile = await getUserCurrentCertificationProfile({
      userId,
      userService,
      competenceRepository
    });

    //then
    expect(actualCertificationProfile).to.deep.equal('certificationProfile');
  });
});
