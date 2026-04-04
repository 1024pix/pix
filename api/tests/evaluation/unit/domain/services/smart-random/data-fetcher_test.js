import * as dataFetcher from '../../../../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Evaluation | Unit | Domain | services | smart-random | dataFetcher', function () {
  describe('#fetchForCampaigns', function () {
    let answerRepository;
    let campaignRepository;
    let smartRandomChallengeRepository;
    let knowledgeElementForParticipationService;
    let knowledgeElementRepository;
    let campaignParticipationRepository;
    let improvementService;

    beforeEach(function () {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      campaignRepository = {
        findSkillsByCampaignParticipationId: sinon.stub(),
      };
      smartRandomChallengeRepository = {
        findOperativeBySkillsAndLocales: sinon.stub(),
      };
      knowledgeElementForParticipationService = {
        findUniqByUserOrCampaignParticipationId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      campaignParticipationRepository = {
        isRetrying: sinon.stub(),
      };
      improvementService = {
        filterKnowledgeElements: sinon.stub(),
      };
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and filteredknowledgeElements on campaign by default', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        campaignParticipationId: 1,
        userId: 5678899,
        isImproving: false,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeElements = Symbol('knowledgeElements');
      const skills = Symbol('skills');
      const isRetrying = false;
      const filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(skills);
      smartRandomChallengeRepository.findOperativeBySkillsAndLocales.resolves(challenges);
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({
          userId: assessment.userId,
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(knowledgeElements);
      campaignParticipationRepository.isRetrying
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(isRetrying);
      improvementService.filterKnowledgeElements
        .withArgs({
          knowledgeElements,
          isRetrying,
          isImproving: true,
          createdAt: assessment.createdAt,
          isFromCampaign: true,
        })
        .resolves(filteredKnowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        campaignRepository,
        smartRandomChallengeRepository,
        knowledgeElementForParticipationService,
        knowledgeElementRepository,
        campaignParticipationRepository,
        improvementService,
        locale: 'fr-fr',
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(smartRandomChallengeRepository.findOperativeBySkillsAndLocales).to.have.been.calledOnceWithExactly(
        skills,
        ['fr-fr', 'fr'],
      );
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and filteredknowledgeElements on campaign is Retrying', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        campaignParticipationId: 1,
        userId: 5678899,
        isImproving: false,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeElements = Symbol('knowledgeElements');
      const skills = Symbol('skills');
      const isRetrying = true;
      const filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(skills);
      smartRandomChallengeRepository.findOperativeBySkillsAndLocales.withArgs(skills).resolves(challenges);
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({
          userId: assessment.userId,
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(knowledgeElements);
      campaignParticipationRepository.isRetrying
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(isRetrying);
      improvementService.filterKnowledgeElements
        .withArgs({
          knowledgeElements,
          isFromCampaign: true,
          isRetrying,
          createdAt: assessment.createdAt,
          isImproving: true,
        })
        .resolves(filteredKnowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        campaignRepository,
        smartRandomChallengeRepository,
        knowledgeElementForParticipationService,
        knowledgeElementRepository,
        campaignParticipationRepository,
        improvementService,
        locale: 'fr-fr',
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });
  });

  describe('#fetchForCompetenceEvaluations', function () {
    let answerRepository;
    let smartRandomChallengeRepository;
    let knowledgeElementRepository;
    let skillRepository;
    let improvementService;
    let data;
    let answer;
    let knowledgeElements;
    let filteredKnowledgeElements;
    let skills;
    let challenges;

    beforeEach(async function () {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      smartRandomChallengeRepository = {
        findValidatedByCompetenceId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      skillRepository = {
        findActiveByCompetenceId: sinon.stub(),
      };
      improvementService = {
        filterKnowledgeElements: sinon.stub(),
      };

      answer = domainBuilder.buildAnswer();
      challenges = [domainBuilder.evaluation.buildSmartRandomChallenge()];
      knowledgeElements = [domainBuilder.buildKnowledgeElement()];
      skills = [domainBuilder.buildSkill()];
      const assessment = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation({
        isImproving: true,
      });
      filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      smartRandomChallengeRepository.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElements
        .withArgs({
          knowledgeElements,
          isRetrying: false,
          isFromCampaign: false,
          isImproving: assessment.isImproving,
          createdAt: assessment.createdAt,
        })
        .resolves(filteredKnowledgeElements);

      // when
      data = await dataFetcher.fetchForCompetenceEvaluations({
        assessment,
        answerRepository,
        smartRandomChallengeRepository,
        knowledgeElementRepository,
        skillRepository,
        improvementService,
      });
    });

    it('filter knowledge elements if assessment is an improving one', async function () {
      // then
      expect(improvementService.filterKnowledgeElements).to.be.called;
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async function () {
      // then
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });
  });
});
