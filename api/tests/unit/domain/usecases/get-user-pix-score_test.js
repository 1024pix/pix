const { sinon, expect } = require('../../../test-helper');
const getUserPixScore = require('../../../../lib/domain/usecases/get-user-pix-score');

describe('Unit | UseCase | get-user-pix-score', () => {

  let knowledgeElementRepository;

  beforeEach(() => {
    knowledgeElementRepository = { getSumOfPixFromUserKnowledgeElements: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should resolve when authenticated user is the same as asked', () => {
    // given
    const userId = 2;
    knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements.resolves([]);

    // when
    const promise = getUserPixScore({
      userId,
      knowledgeElementRepository,
    });

    // then
    return expect(promise).to.be.fulfilled;
  });

  it('should return the user Pix score', async () => {
    // given
    const userId = 2;
    const sumOfPixKnowledgeElement = 6;
    const pixScoreExpected = {
      id: userId,
      value: sumOfPixKnowledgeElement
    };

    knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements.resolves(sumOfPixKnowledgeElement);

    // when
    const userPixScore = await getUserPixScore({
      userId,
      knowledgeElementRepository,
    });

    //then
    expect(userPixScore).to.deep.equal(pixScoreExpected);
  });
});
