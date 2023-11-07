import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getNextChallengeForCampaignAssessment } from '../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment.js';
import * as algorithmDataFetcherService from '../../../../lib/domain/services/algorithm-methods/data-fetcher.js';

import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { FRENCH_SPOKEN } = LOCALE;

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
      smartRandom,
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

      smartRandom = {
        getPossibleSkillsForNextChallenge: sinon.stub().returns({
          hasAssessmentEnded: false,
          possibleSkillsForNextChallenge,
        }),
      };

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
        smartRandom,
        algorithmDataFetcherService,
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
      expect(challengeRepository.findOperativeBySkills).to.have.been.calledWithExactly(skills, locale);
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
});
