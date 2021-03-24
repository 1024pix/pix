const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForCampaignAssessment = require('../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function() {

  describe('#getNextChallengeForCampaignAssessment', function() {

    let userId, assessmentId, campaignParticipationId,
      assessment, lastAnswer, answerRepository, challengeRepository, challenges,
      knowledgeElementRepository, recentKnowledgeElements,
      targetProfileRepository, targetProfile, skills, actualNextChallenge,
      improvementService, pickChallengeService,
      challengeWeb21, challengeWeb22, possibleSkillsForNextChallenge, locale;

    beforeEach(async function() {

      userId = 'dummyUserId';
      assessmentId = 21;
      campaignParticipationId = 456;
      lastAnswer = null;

      answerRepository = { findByAssessment: sinon.stub().resolves([lastAnswer]) };
      challenges = [];
      challengeRepository = { findOperativeBySkills: sinon.stub().resolves(challenges) };
      assessment = { id: assessmentId, userId, campaignParticipationId, isImproving: false };
      skills = [];
      targetProfile = { skills };
      targetProfileRepository = { getByCampaignParticipationId: sinon.stub().resolves(targetProfile) };
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

    it('should have fetched the answers', function() {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have filter the knowledge elements with an assessment improving', function() {
      // given
      const expectedAssessment = assessment;
      expectedAssessment.isImproving = true;

      expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly(({
        knowledgeElements: recentKnowledgeElements,
        assessment: expectedAssessment,
      }));
    });

    it('should have fetched the target profile', function() {
      expect(targetProfileRepository.getByCampaignParticipationId).to.have.been.calledWithExactly(campaignParticipationId);
    });

    it('should have fetched the most recent knowledge elements', function() {
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
    });

    it('should have fetched the challenges', function() {
      expect(challengeRepository.findOperativeBySkills).to.have.been.calledWithExactly(skills);
    });

    it('should have fetched the next challenge with only most recent knowledge elements', function() {
      const allAnswers = [lastAnswer];
      expect(smartRandom.getPossibleSkillsForNextChallenge).to.have.been.calledWithExactly({
        allAnswers,
        lastAnswer,
        challenges,
        targetSkills: targetProfile.skills,
        knowledgeElements: recentKnowledgeElements,
        locale,
      });
    });

    it('should have returned the next challenge', function() {
      expect(actualNextChallenge.id).to.equal(challengeWeb22.id);
    });

    it('should have pick challenge with skills, randomSeed and locale', function() {
      expect(pickChallengeService.pickChallenge).to.have.been.calledWithExactly({
        skills: possibleSkillsForNextChallenge,
        randomSeed: assessmentId,
        locale,
      });
    });
  });

});
