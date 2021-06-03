const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getChallengeSolutionForPixButton = require('../../../../lib/domain/usecases/get-challenge-solution-for-pix-button');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Unit | UseCase | get-challenge-answer-for-pix-button', () => {

  let assessment;
  const challengeId = 1;
  const solution = 'answer \n answer';
  const lastChallengeId = 'last challenge id';

  beforeEach(() => {
    assessment = domainBuilder.buildAssessment({
      lastChallengeId,
    });

    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeRepository, 'getSolution');
  });

  it('should return the solution of the last challenge from the given assessment', async () => {
    assessmentRepository.get.resolves(assessment);
    challengeRepository.getSolution.resolves(solution);

    const result = await getChallengeSolutionForPixButton({ challengeId, assessmentRepository, challengeRepository });

    expect(result).to.equal(solution);
  });

});
