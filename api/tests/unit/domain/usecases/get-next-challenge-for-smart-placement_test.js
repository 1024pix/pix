const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    let userId, assessmentId, targetProfileId, campaignParticipation,
      assessment, answers, answerRepository, challengeRepository, challenges,
      knowledgeElementRepository, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, expectedNextChallenge, actualNextChallenge;

    beforeEach(async () => {

      userId = 'dummyUserId';
      targetProfileId = 'dummyTargetProfileId';
      assessmentId = 'dummyAssessmentId';

      answers = [];
      answerRepository = { findByAssessment: sinon.stub().resolves(answers) };
      challenges = [];
      challengeRepository = { findBySkills: sinon.stub().resolves(challenges) };
      campaignParticipation = { getTargetProfileId: sinon.stub().returns(targetProfileId) };
      assessment = domainBuilder.buildAssessment({ id: assessmentId, userId, campaignParticipation });
      skills = [];
      targetProfile = { skills };
      targetProfileRepository = { get: sinon.stub().resolves(targetProfile) };

      recentKnowledgeElements = [{ createdAt: 4, skillId: 'url2' }, { createdAt: 2, skillId: 'web1' }];
      knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };
      expectedNextChallenge = { some: 'next challenge' };

      sinon.stub(smartRandom, 'getNextChallenge').returns({
        hasAssessmentEnded: false,
        nextChallenge: expectedNextChallenge,
      });

      actualNextChallenge = await getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        knowledgeElementRepository,
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
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
    });

    it('should have fetched the challenges', () => {
      expect(challengeRepository.findBySkills).to.have.been.calledWithExactly(skills);
    });

    it('should have fetched the next challenge with only most recent knowledge elements', () => {
      expect(smartRandom.getNextChallenge).to.have.been.calledWithExactly({
        answers, challenges, targetSkills: targetProfile.skills, knowledgeElements: recentKnowledgeElements
      });
    });

    it('should have returned the next challenge', () => {
      expect(actualNextChallenge).to.deep.equal(expectedNextChallenge);
    });

  });

});
