import { sinon, expect, domainBuilder } from '../../../../test-helper';
import dataFetcher from '../../../../../lib/domain/services/algorithm-methods/data-fetcher';

describe('Unit | Domain | services | smart-random | dataFetcher', function () {
  describe('#fetchForCampaigns', function () {
    let answerRepository;
    let campaignRepository;
    let challengeRepository;
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
      challengeRepository = {
        findOperativeBySkills: sinon.stub(),
        answerRepository,
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      campaignParticipationRepository = {
        isRetrying: sinon.stub(),
      };
      improvementService = {
        filterKnowledgeElementsIfImproving: sinon.stub(),
      };
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and knowledgeElements', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        campaignParticipationId: 1,
        userId: 5678899,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeElements = Symbol('knowledgeElements');
      const skills = Symbol('skills');
      const isRetrying = Symbol('isRetrying');
      const filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
        .resolves(skills);
      challengeRepository.findOperativeBySkills.withArgs(skills).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      campaignParticipationRepository.isRetrying
        .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
        .resolves(isRetrying);
      improvementService.filterKnowledgeElementsIfImproving
        .withArgs({ knowledgeElements, assessment, isRetrying })
        .resolves(filteredKnowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        campaignRepository,
        challengeRepository,
        knowledgeElementRepository,
        campaignParticipationRepository,
        improvementService,
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
    let challengeRepository;
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
      challengeRepository = {
        findValidatedByCompetenceId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      skillRepository = {
        findActiveByCompetenceId: sinon.stub(),
      };
      improvementService = {
        filterKnowledgeElementsIfImproving: sinon.stub(),
      };

      answer = domainBuilder.buildAnswer();
      challenges = [domainBuilder.buildChallenge()];
      knowledgeElements = [domainBuilder.buildKnowledgeElement()];
      skills = [domainBuilder.buildSkill()];
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign();
      filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengeRepository.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElementsIfImproving
        .withArgs({ knowledgeElements, assessment, isRetrying: false })
        .resolves(filteredKnowledgeElements);

      // when
      data = await dataFetcher.fetchForCompetenceEvaluations({
        assessment,
        answerRepository,
        challengeRepository,
        knowledgeElementRepository,
        skillRepository,
        improvementService,
      });
    });

    it('filter knowledge elements if assessment is an improving one', async function () {
      // then
      expect(improvementService.filterKnowledgeElementsIfImproving).to.be.called;
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

  describe('#fetchForFlashCampaigns', function () {
    let answerRepository;
    let challengeRepository;
    let flashAssessmentResultRepository;

    beforeEach(function () {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      challengeRepository = {
        findActiveFlashCompatible: sinon.stub(),
      };
      flashAssessmentResultRepository = {
        getLatestByAssessmentId: sinon.stub(),
      };
    });

    it('fetches answers and challenges', async function () {
      // given
      const { id: assessmentId } = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        method: 'FLASH',
        campaignParticipationId: 1,
        userId: 5678899,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const estimatedLevel = Symbol('estimatedLevel');

      answerRepository.findByAssessment.withArgs(assessmentId).resolves([answer]);
      challengeRepository.findActiveFlashCompatible.withArgs().resolves(challenges);
      flashAssessmentResultRepository.getLatestByAssessmentId.withArgs(assessmentId).resolves({ estimatedLevel });

      // when
      const data = await dataFetcher.fetchForFlashCampaigns({
        assessmentId,
        answerRepository,
        challengeRepository,
        flashAssessmentResultRepository,
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.estimatedLevel).to.equal(estimatedLevel);
    });
  });

  describe('#fetchForFlashLevelEstimation', function () {
    let answerRepository;
    let challengeRepository;

    beforeEach(function () {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      challengeRepository = {
        getMany: sinon.stub(),
      };
    });

    it('fetches answers and challenges', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        method: 'FLASH',
        campaignParticipationId: 1,
        userId: 5678899,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      challengeRepository.getMany.withArgs().resolves(challenges);

      // when
      const data = await dataFetcher.fetchForFlashLevelEstimation({
        assessment,
        answerRepository,
        challengeRepository,
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.challenges).to.deep.equal(challenges);
    });
  });
});
