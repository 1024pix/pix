import { getChallengeForPixAutoAnswer } from '../../../../lib/domain/usecases/get-challenge-for-pix-auto-answer.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-challenge-answer-for-pix-button', function () {
  let assessment;
  let assessmentRepository;
  let challengeForPixAutoAnswerRepository;
  const challengeId = 1;
  const challenge = {
    id: challengeId,
    solution: 'answer \n answer',
    type: 'QROC',
    isAutoReply: false,
  };
  const lastChallengeId = 'last challenge id';

  beforeEach(function () {
    assessment = domainBuilder.buildAssessment({
      lastChallengeId,
    });

    assessmentRepository = { get: sinon.stub() };
    challengeForPixAutoAnswerRepository = { get: sinon.stub() };
  });

  it('should return the solution of the last challenge from the given assessment', async function () {
    assessmentRepository.get.resolves(assessment);
    challengeForPixAutoAnswerRepository.get.resolves(challenge);

    const result = await getChallengeForPixAutoAnswer({
      challengeId,
      assessmentRepository,
      challengeForPixAutoAnswerRepository,
    });

    expect(result).to.deep.equal(challenge);
  });
});
