const { expect, sinon, catchErr } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getNextChallengeForCompetenceEvaluation = require('../../../../lib/domain/usecases/get-next-challenge-for-competence-evaluation');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');

describe('Unit | Domain | Use Cases | get-next-challenge-for-competence-evaluation', () => {

  describe('#getNextChallengeForCompetenceEvaluation', () => {

    let userId, assessmentId, competenceId,
      assessment, lastAnswer, challenges, targetSkills,
      answerRepository, challengeRepository, skillRepository,
      knowledgeElementRepository,
      recentKnowledgeElements, expectedNextChallenge, actualComputedChallenge;

    beforeEach(async () => {

      userId = 'dummyUserId';
      competenceId = 'dummyCompetenceId';
      assessmentId = 'dummyAssessmentId';

      assessment = { id: assessmentId, userId, competenceId };
      challenges = [];
      targetSkills = [];
      lastAnswer = null;

      answerRepository = { findLastByAssessment: sinon.stub().resolves(lastAnswer) };
      challengeRepository = { findByCompetenceId: sinon.stub().resolves(challenges) };
      skillRepository = { findByCompetenceId: sinon.stub().resolves(targetSkills) };

      recentKnowledgeElements = [{ createdAt: 4, skillId: 'url2' }, { createdAt: 2, skillId: 'web1' }];
      knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };
      expectedNextChallenge = { some: 'next challenge' };

      sinon.stub(smartRandom, 'getNextChallenge').returns({
        hasAssessmentEnded: false,
        nextChallenge: expectedNextChallenge,
      });
    });

    context('when user is not related to assessment', () => {
      let requestErr;
      beforeEach(async () => {
        requestErr = await catchErr(getNextChallengeForCompetenceEvaluation)({
          assessment,
          userId: userId + 1,
          answerRepository,
          challengeRepository,
          knowledgeElementRepository,
          skillRepository
        });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });

    context('when user is related to assessment', () => {
      beforeEach(async () => {
        actualComputedChallenge = await getNextChallengeForCompetenceEvaluation({
          assessment,
          userId,
          answerRepository,
          challengeRepository,
          knowledgeElementRepository,
          skillRepository,
        });
      });
      it('should have fetched the answers', () => {
        expect(answerRepository.findLastByAssessment).to.have.been.calledWithExactly(assessmentId);
      });

      it('should have fetched the most recent knowledge elements', () => {
        expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
      });

      it('should have fetched the challenges', () => {
        expect(challengeRepository.findByCompetenceId).to.have.been.calledWithExactly(competenceId);
      });

      it('should have fetched the next challenge with only most recent knowledge elements', () => {
        expect(smartRandom.getNextChallenge).to.have.been.calledWithExactly({
          lastAnswer, challenges, targetSkills, knowledgeElements: recentKnowledgeElements, assessmentId
        });
      });

      it('should have returned the next challenge', () => {
        expect(actualComputedChallenge).to.deep.equal(expectedNextChallenge);
      });
    });
  });
});
