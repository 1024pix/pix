const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForCampaignAssessment = require('../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Domain | Use Cases | get-next-challenge-for-campaign-assessment', () => {

  describe('#getNextChallengeForCampaignAssessment', () => {

    let userId, assessmentId, targetProfileId, campaignParticipation,
      assessment, lastAnswer, answerRepository, challengeRepository, challenges,
      knowledgeElementRepository, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, actualNextChallenge,
      improvementService, pickChallengeService,
      challengeWeb21, challengeWeb22, possibleSkillsForNextChallenge, locale;

    beforeEach(async () => {

      userId = 'dummyUserId';
      targetProfileId = 'dummyTargetProfileId';
      assessmentId = 21;
      lastAnswer = null;

      answerRepository = { findByAssessment: sinon.stub().resolves([lastAnswer]) };
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

      locale = FRENCH_SPOKEN;
      possibleSkillsForNextChallenge = [web2, url2, search2];

      sinon.stub(smartRandom, 'getPossibleSkillsForNextChallenge').returns({
        hasAssessmentEnded: false,
        possibleSkillsForNextChallenge,
      });

      actualNextChallenge = await getNextChallengeForCampaignAssessment({
        assessment,
        answerRepository,
        challengeRepository,
        knowledgeElementRepository,
        targetProfileRepository,
        improvementService,
        pickChallengeService,
        tryImproving: true,
        locale,
      });
    });

    it('should have fetched the answers', () => {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
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
      const allAnswers = [lastAnswer];
      expect(smartRandom.getPossibleSkillsForNextChallenge).to.have.been.calledWithExactly({
        allAnswers,
        lastAnswer,
        challenges,
        targetSkills: targetProfile.skills,
        knowledgeElements: recentKnowledgeElements,
      });
    });

    it('should have returned the next challenge', () => {
      expect(actualNextChallenge.id).to.equal(challengeWeb22.id);
    });

    it('should have pick challenge with skills, randomSeed and locale', () => {
      expect(pickChallengeService.pickChallenge).to.have.been.calledWithExactly({
        skills: possibleSkillsForNextChallenge,
        randomSeed: assessmentId,
        locale,
      });
    });
  });

});
