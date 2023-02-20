import { expect, sinon, domainBuilder } from '../../../test-helper';
import getChallengeForPixAutoAnswer from '../../../../lib/domain/usecases/get-challenge-for-pix-auto-answer';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import challengeForPixAutoAnswerRepository from '../../../../lib/infrastructure/repositories/challenge-for-pix-auto-answer-repository';

describe('Unit | UseCase | get-challenge-answer-for-pix-button', function () {
  let assessment;
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

    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeForPixAutoAnswerRepository, 'get');
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
