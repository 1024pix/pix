const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    let userId, assessmentId, targetProfileId, campaignParticipation,
      assessment, lastAnswer, answerRepository, challengeRepository, challenges,
      knowledgeElementRepository, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, actualNextChallenge,
      improvementService, pickChallengeService,
      challengeWeb21, challengeWeb22;

    beforeEach(async () => {

      userId = 'dummyUserId';
      targetProfileId = 'dummyTargetProfileId';
      assessmentId = 21;
      lastAnswer = null;

      answerRepository = { findLastByAssessment: sinon.stub().resolves(lastAnswer) };
      challenges = [];
      challengeRepository = { findBySkills: sinon.stub().resolves(challenges) };
      campaignParticipation = { getTargetProfileId: sinon.stub().returns(targetProfileId) };
      assessment = { id: assessmentId, userId, campaignParticipation, isImproving: false };
      skills = [];
      targetProfile = { skills };
      targetProfileRepository = { get: sinon.stub().resolves(targetProfile) };
      improvementService = { filterKnowledgeElementsIfImproving: sinon.stub().returns(recentKnowledgeElements) };
      pickChallengeService = { pickChallenge: sinon.stub().resolves(challengeWeb22) };

      recentKnowledgeElements = [{ createdAt: 4, skillId: 'url2' }, { createdAt: 2, skillId: 'web1' }];
      knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };

      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      challengeWeb21 = domainBuilder.buildChallenge({ id: 'challenge_web2_1' });
      challengeWeb22 = domainBuilder.buildChallenge({ id: 'challenge_web2_2' });
      web2.challenges = [challengeWeb21, challengeWeb22];
      const url2 = domainBuilder.buildSkill({ name: '@url2' });
      url2.challenges = [domainBuilder.buildChallenge({ id: 'challenge_url2_1' }), domainBuilder.buildChallenge({ id: 'challenge_url2_2' })];
      const search2 = domainBuilder.buildSkill({ name: '@search2' });
      search2.challenges = [domainBuilder.buildChallenge({ id: 'challenge_search2_1' }), domainBuilder.buildChallenge({ id: 'challenge_search2_2' })];

      sinon.stub(smartRandom, 'getPossibleSkillsForNextChallenge').returns({
        hasAssessmentEnded: false,
        possibleSkillsForNextChallenge: [web2, url2, search2],
      });

      actualNextChallenge = await getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        knowledgeElementRepository,
        targetProfileRepository,
        improvementService,
        pickChallengeService,
        tryImproving: true
      });
    });

    it('should have fetched the answers', () => {
      expect(answerRepository.findLastByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have filter the knowledge elements with an assessment improving', () => {
      // given
      const expectedAssessment = assessment;
      expectedAssessment.isImproving = true;

      expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly(({
        knowledgeElements: recentKnowledgeElements,
        assessment: expectedAssessment
      }));
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
      expect(smartRandom.getPossibleSkillsForNextChallenge).to.have.been.calledWithExactly({
        lastAnswer,
        challenges,
        targetSkills: targetProfile.skills,
        knowledgeElements: recentKnowledgeElements,
      });
    });

    it('should have returned the next challenge', () => {
      expect(actualNextChallenge.id).to.equal(challengeWeb22.id);
    });
  });

});
