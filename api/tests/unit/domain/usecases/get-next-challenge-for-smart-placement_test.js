const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const smartRandom = require('../../../../lib/domain/strategies/smart-random');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    let sandbox, userId, assessmentId, targetProfileId, campaignParticipation,
      assessment, answers, answerRepository, challengeRepository, challenges,
      smartPlacementKnowledgeElementRepository, knowledgeElements, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, expectedComputedChallenge, actualComputedChallenge;

    beforeEach(async () => {
      sandbox = sinon.sandbox.create();

      userId = 'dummyUserId';
      targetProfileId = 'dummyTargetProfileId';
      assessmentId = 'dummyAssessmentId';

      answers = [];
      answerRepository = { findByAssessment: sandbox.stub().resolves(answers) };
      challenges = [];
      challengeRepository = { findBySkills: sandbox.stub().resolves(challenges) };
      campaignParticipation = { getTargetProfileId: sandbox.stub().returns(targetProfileId) };
      assessment = { id: assessmentId, userId, campaignParticipation };
      skills = [];
      targetProfile = { skills };
      targetProfileRepository = { get: sandbox.stub().resolves(targetProfile) };
      knowledgeElements = [{ createdAt: 1, skillId: 'web1' }, { createdAt: 2, skillId: 'web1' }, { createdAt: 4, skillId: 'url2' }];
      recentKnowledgeElements = [{ createdAt: 4, skillId: 'url2' }, { createdAt: 2, skillId: 'web1' }];
      smartPlacementKnowledgeElementRepository = { findByUserId: sandbox.stub().resolves(knowledgeElements) };
      expectedComputedChallenge = {};
      sandbox.stub(smartRandom, 'getNextChallenge').resolves(expectedComputedChallenge);

      actualComputedChallenge = await getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should have fetched the answers', () => {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have fetched the target profile', () => {
      expect(targetProfileRepository.get).to.have.been.calledWithExactly(targetProfileId);
    });

    it('should have fetched the most recent knowledge elements', () => {
      expect(smartPlacementKnowledgeElementRepository.findByUserId).to.have.been.calledWithExactly(userId);
    });

    it('should have fetched the challenges', () => {
      expect(challengeRepository.findBySkills).to.have.been.calledWithExactly(skills);
    });

    it('should have fetched the next challenge with only most recent knowledge elements', () => {
      expect(smartRandom.getNextChallenge).to.have.been.calledWithExactly({
        answers, challenges, targetProfile, knowledgeElements: recentKnowledgeElements
      });
    });

    it('should have returned the next challenge', () => {
      expect(actualComputedChallenge).to.deep.equal(expectedComputedChallenge);
    });

  });

});
