const { sinon, expect } = require('../../../test-helper');
const getUserPixScore = require('../../../../lib/domain/usecases/get-user-pix-score');

describe('Unit | UseCase | get-user-pix-score', () => {

  let competenceRepository;

  beforeEach(() => {
    competenceRepository = { getPixScoreByCompetence: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should resolve when authenticated user is the same as asked', () => {
    // given
    const userId = 2;
    competenceRepository.getPixScoreByCompetence.resolves({});

    // when
    const promise = getUserPixScore({
      userId,
      competenceRepository,
    });

    // then
    return expect(promise).to.be.fulfilled;
  });

  it('should sum the competence Pix scores', async () => {
    // given
    const userId = 2;
    const sumOfPixCompetenceScores = 7;
    const pixScoreExpected = {
      id: userId,
      value: sumOfPixCompetenceScores
    };

    competenceRepository.getPixScoreByCompetence.resolves({
      'recCompetence1': 2,
      'recCompetence2': 5,
    });

    // when
    const userPixScore = await getUserPixScore({
      userId,
      competenceRepository,
    });

    //then
    expect(userPixScore).to.deep.equal(pixScoreExpected);
  });
});
