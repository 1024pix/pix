const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForCampaignAssessment = require('../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment');
const flash = require('../../../../lib/domain/services/algorithm-methods/flash');
const smartRandom = require('../../../../lib/domain/services/algorithm-methods/smart-random');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function () {
  describe('#getNextChallengeForCampaignAssessment : case for SMART RANDOM', function () {
    let userId,
      assessmentId,
      campaignParticipationId,
      assessment,
      lastAnswer,
      answerRepository,
      challengeRepository,
      campaignRepository,
      challenges,
      knowledgeElementRepository,
      recentKnowledgeElements,
      campaignParticipationRepository,
      isRetrying,
      targetProfile,
      skills,
      actualNextChallenge,
      improvementService,
      pickChallengeService,
      challengeWeb21,
      challengeWeb22,
      possibleSkillsForNextChallenge,
      locale;

    beforeEach(async function () {
      userId = 'dummyUserId';
      assessmentId = 21;
      campaignParticipationId = 456;
      lastAnswer = null;

      answerRepository = { findByAssessment: sinon.stub().resolves([lastAnswer]) };
      challenges = [];
      challengeRepository = { findOperativeBySkills: sinon.stub().resolves(challenges) };
      assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        id: assessmentId,
        userId,
        campaignParticipationId,
        isImproving: false,
      });
      skills = [];
      targetProfile = { skills };
      campaignRepository = { findSkillsByCampaignParticipationId: sinon.stub().resolves(skills) };
      improvementService = { filterKnowledgeElementsIfImproving: sinon.stub().returns(recentKnowledgeElements) };
      pickChallengeService = { pickChallenge: sinon.stub().resolves(challengeWeb22) };

      recentKnowledgeElements = [
        { createdAt: 4, skillId: 'url2' },
        { createdAt: 2, skillId: 'web1' },
      ];
      knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };

      isRetrying = false;
      campaignParticipationRepository = { isRetrying: sinon.stub().resolves(isRetrying) };
      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      challengeWeb21 = domainBuilder.buildChallenge({ id: 'challenge_web2_1' });
      challengeWeb22 = domainBuilder.buildChallenge({ id: 'challenge_web2_2' });
      web2.challenges = [challengeWeb21, challengeWeb22];
      const url2 = domainBuilder.buildSkill({ name: '@url2' });
      url2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_url2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_url2_2' }),
      ];
      const search2 = domainBuilder.buildSkill({ name: '@search2' });
      search2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_search2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_search2_2' }),
      ];

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
        campaignParticipationRepository,
        campaignRepository,
        improvementService,
        pickChallengeService,
        locale,
      });
    });

    it('should have fetched the answers', function () {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have filter the knowledge elements with an assessment improving', function () {
      // given
      const expectedAssessment = assessment;
      expectedAssessment.isImproving = true;

      expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly({
        knowledgeElements: recentKnowledgeElements,
        assessment: expectedAssessment,
        isRetrying,
      });
    });

    it('should have fetched the target profile', function () {
      expect(campaignRepository.findSkillsByCampaignParticipationId).to.have.been.calledWithExactly({
        campaignParticipationId,
      });
    });

    it('should have fetched the most recent knowledge elements', function () {
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
    });

    it('should have fetched the challenges', function () {
      expect(challengeRepository.findOperativeBySkills).to.have.been.calledWithExactly(skills);
    });

    it('should have fetched the next challenge with only most recent knowledge elements', function () {
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

    it('should have returned the next challenge', function () {
      expect(actualNextChallenge.id).to.equal(challengeWeb22.id);
    });

    it('should have pick challenge with skills, randomSeed and locale', function () {
      expect(pickChallengeService.pickChallenge).to.have.been.calledWithExactly({
        skills: possibleSkillsForNextChallenge,
        randomSeed: assessmentId,
        locale,
      });
    });
  });

  describe('#getNextChallengeForCampaignAssessment : case for FLASH', function () {
    let userId,
      assessmentId,
      campaignParticipationId,
      assessment,
      lastAnswer,
      answerRepository,
      challengeRepository,
      challenges,
      campaignParticipationRepository,
      flashAssessmentResultRepository,
      actualNextChallenge,
      improvementService,
      challengeWeb21,
      challengeWeb22,
      possibleChallenges,
      locale,
      estimatedLevel;

    beforeEach(async function () {
      // given
      userId = 'dummyUserId';
      assessmentId = 21;
      campaignParticipationId = 456;
      lastAnswer = null;

      answerRepository = { findByAssessment: sinon.stub().resolves([lastAnswer]) };
      challenges = [];
      challengeRepository = { findActiveFlashCompatible: sinon.stub().resolves(challenges) };
      const campaign = domainBuilder.buildCampaign({ assessmentMethod: 'FLASH' });
      domainBuilder.buildCampaignParticipation({ campaign, id: campaignParticipationId });
      assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        id: assessmentId,
        userId,
        campaignParticipationId,
        isImproving: false,
        method: 'FLASH',
      });

      estimatedLevel = Symbol('estimatedLevel');
      flashAssessmentResultRepository = {
        getLatestByAssessmentId: sinon.stub(),
      };
      flashAssessmentResultRepository.getLatestByAssessmentId.withArgs(assessmentId).resolves({ estimatedLevel });

      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      challengeWeb21 = domainBuilder.buildChallenge({ id: 'challenge_web2_1' });
      challengeWeb22 = domainBuilder.buildChallenge({ id: 'challenge_web2_2' });
      web2.challenges = [challengeWeb21, challengeWeb22];
      const url2 = domainBuilder.buildSkill({ name: '@url2' });
      url2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_url2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_url2_2' }),
      ];
      const search2 = domainBuilder.buildSkill({ name: '@search2' });
      search2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_search2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_search2_2' }),
      ];

      locale = FRENCH_SPOKEN;
      possibleChallenges = [challengeWeb21, challengeWeb22];

      sinon.stub(flash, 'getPossibleNextChallenges').returns({
        hasAssessmentEnded: false,
        possibleChallenges,
      });

      // when
      actualNextChallenge = await getNextChallengeForCampaignAssessment({
        assessment,
        answerRepository,
        challengeRepository,
        campaignParticipationRepository,
        flashAssessmentResultRepository,
        improvementService,
        locale,
      });
    });

    it('should have fetched the answers', function () {
      // then
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });

    it('should have fetched the challenges', function () {
      // then
      expect(challengeRepository.findActiveFlashCompatible).to.have.been.called;
    });

    it('should have fetched the next challenge with only most recent knowledge elements', function () {
      // then
      const allAnswers = [lastAnswer];
      expect(flash.getPossibleNextChallenges).to.have.been.calledWithExactly({
        allAnswers,
        challenges,
        estimatedLevel,
      });
    });

    it('should have returned the next challenge', function () {
      // then
      expect(actualNextChallenge.id).to.equal(challengeWeb22.id);
    });
  });
});
