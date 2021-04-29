const { sinon, expect, domainBuilder } = require('../../../../test-helper');
const dataFetcher = require('../../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | Domain | services | smart-random | dataFetcher', () => {

  describe('#fetchForCampaigns', () => {

    let answerRepository;
    let targetProfileRepository;
    let challengeRepository;
    let knowledgeElementRepository;
    let campaignParticipationRepository;
    let improvementService;

    beforeEach(() => {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      targetProfileRepository = {
        getByCampaignParticipationId: sinon.stub(),
      };
      challengeRepository = {
        findOperativeBySkills: sinon.stub(), answerRepository,
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

    it('fetches answers, lastAnswer, targetsSkills challenges and knowledgeElements', async () => {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ state: 'started', campaignParticipationId: 1, userId: 5678899 });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeElements = Symbol('knowledgeElements');
      const targetProfile = Symbol('targetProfile');
      const isRetrying = Symbol('isRetrying');
      const filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      targetProfileRepository.getByCampaignParticipationId.withArgs(assessment.campaignParticipationId).resolves(targetProfile);
      challengeRepository.findOperativeBySkills.withArgs(targetProfile.skills).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      campaignParticipationRepository.isRetrying.withArgs({ campaignParticipationId: assessment.campaignParticipationId }).resolves(isRetrying);
      improvementService.filterKnowledgeElementsIfImproving.withArgs({ knowledgeElements, assessment, isRetrying }).resolves(filteredKnowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        targetProfileRepository,
        challengeRepository,
        knowledgeElementRepository,
        campaignParticipationRepository,
        improvementService,
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(targetProfile.skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });

  });

  describe('#fetchForCompetenceEvaluations', () => {

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

    beforeEach(async () => {
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
      challenges = [
        domainBuilder.buildChallenge(),
      ];
      knowledgeElements = [
        domainBuilder.buildKnowledgeElement(),
      ];
      skills = [
        domainBuilder.buildSkill(),
      ];
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign();
      filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengeRepository.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElementsIfImproving.withArgs({ knowledgeElements, assessment, isRetrying: false }).resolves(filteredKnowledgeElements);

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

    it('filter knowledge elements if assessment is an improving one', async () => {
      // then
      expect(improvementService.filterKnowledgeElementsIfImproving).to.be.called;
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async () => {
      // then
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });
  });

});
