const { sinon, expect, domainBuilder } = require('../../../../test-helper');
const dataFetcher = require('../../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | Domain | services | smart-random | dataFetcher', function() {

  describe('#fetchForCampaigns', function() {

    let answerRepository;
    let targetProfileRepository;
    let challengeRepository;
    let knowledgeElementRepository;
    let improvementService;

    beforeEach(function() {
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
      improvementService = {
        filterKnowledgeElementsIfImproving: sinon.stub(),
      };
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and knowledgeElements', async function() {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ state: 'started', campaignParticipationId: 1 });
      const answer = domainBuilder.buildAnswer();
      const challenges = [
        domainBuilder.buildChallenge(),
      ];
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement(),
      ];
      const targetProfile = domainBuilder.buildTargetProfile();

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      targetProfileRepository.getByCampaignParticipationId.withArgs(assessment.campaignParticipationId).resolves(targetProfile);
      challengeRepository.findOperativeBySkills.withArgs(targetProfile.skills).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElementsIfImproving.resolves(knowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        targetProfileRepository,
        challengeRepository,
        knowledgeElementRepository,
        improvementService,
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(targetProfile.skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(knowledgeElements);
    });

  });

  describe('#fetchForCompetenceEvaluations', function() {

    let answerRepository;
    let challengeRepository;
    let knowledgeElementRepository;
    let skillRepository;
    let improvementService;
    let data;
    let answer;
    let knowledgeElements;
    let skills;
    let challenges;

    beforeEach(async function() {
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

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengeRepository.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElementsIfImproving.resolves(knowledgeElements);

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

    it('filter knowledge elements if assessment is an improving one', async function() {
      // then
      expect(improvementService.filterKnowledgeElementsIfImproving).to.be.called;
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async function() {
      // then
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(knowledgeElements);
    });
  });

});
