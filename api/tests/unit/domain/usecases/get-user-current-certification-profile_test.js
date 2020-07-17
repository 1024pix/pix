const { sinon, expect } = require('../../../test-helper');
const getUserCurrentCertificationProfile = require('../../../../lib/domain/usecases/get-user-current-certification-profile');

describe('Unit | UseCase | get-user-current-certification-profile', () => {

  let certificationProfileService;
  let competenceRepository;
  let clock;
  const now = new Date(2020, 1, 1);
  const competences = [{ id: 'rec1' }, { id: 'rec2' }];

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    certificationProfileService = { getCertificationProfile: sinon.stub() };
    competenceRepository = { listPixCompetencesOnly: sinon.stub().resolves(competences) };
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
      competenceRepository
    });

    //then
    expect(actualCertificationProfile).to.deep.equal('certificationProfile');
  });
});
