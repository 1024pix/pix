const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const SmartRandom = require('../../../../lib/domain/services/smart-random/SmartRandom');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    let userId, assessmentId, targetProfileId, campaignParticipation,
      assessment, answers, answerRepository, challengeRepository, challenges,
      smartPlacementKnowledgeElementRepository, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, expectedComputedChallenge, actualComputedChallenge;

    beforeEach(async () => {

      userId = 'dummyUserId';
      targetProfileId = 'dummyTargetProfileId';
      assessmentId = 'dummyAssessmentId';

      answers = [];
      answerRepository = { findByAssessment: sinon.stub().resolves(answers) };
      challenges = [];
      challengeRepository = { findBySkills: sinon.stub().resolves(challenges) };
      campaignParticipation = { getTargetProfileId: sinon.stub().returns(targetProfileId) };
      assessment = { id: assessmentId, userId, campaignParticipation };
      skills = [];
      targetProfile = { skills };
      targetProfileRepository = { get: sinon.stub().resolves(targetProfile) };

      recentKnowledgeElements = [{ createdAt: 4, skillId: 'url2' }, { createdAt: 2, skillId: 'web1' }];
      smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };
      expectedComputedChallenge = {};
      sinon.stub(SmartRandom, 'getNextChallenge').resolves(expectedComputedChallenge);

      actualComputedChallenge = await getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository
      });
    });

    it('should have fetched the answers', () => {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have fetched the target profile', () => {
      expect(targetProfileRepository.get).to.have.been.calledWithExactly(targetProfileId);
    });

    it('should have fetched the most recent knowledge elements', () => {
      expect(smartPlacementKnowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
    });

    it('should have fetched the challenges', () => {
      expect(challengeRepository.findBySkills).to.have.been.calledWithExactly(skills);
    });

    it('should have fetched the next challenge with only most recent knowledge elements', () => {
      expect(SmartRandom.getNextChallenge).to.have.been.calledWithExactly({
        answers, challenges, targetSkills: targetProfile.skills, knowledgeElements: recentKnowledgeElements
      });
    });

    it('should have returned the next challenge', () => {
      expect(actualComputedChallenge).to.deep.equal(expectedComputedChallenge);
    });

  });

});
