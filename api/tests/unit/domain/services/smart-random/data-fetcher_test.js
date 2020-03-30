const { sinon, expect, domainBuilder } = require('../../../../test-helper');
const dataFetcher = require('../../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | Domain | services | smart-random | dataFetcher', () => {

  describe('#fetchForCampaigns', () => {

    let answerRepository;
    let targetProfileRepository;
    let challengeRepository;
    let knowledgeElementRepository;
    let improvementService;

    beforeEach(() => {
      answerRepository = {
        findLastByAssessment: sinon.stub(),
      };
      targetProfileRepository = {
        get: sinon.stub(),
      };
      challengeRepository = {
        findBySkills: sinon.stub(),answerRepository
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      improvementService = {
        filterKnowledgeElementsIfImproving: sinon.stub(),
      };
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async () => {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement({ state: 'started' });
      const answer = domainBuilder.buildAnswer();
      const challenges = [
        domainBuilder.buildChallenge(),
      ];
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement(),
      ];
      const targetProfile = domainBuilder.buildTargetProfile();

      assessment.campaignParticipation.getTargetProfileId = () => 1;
      answerRepository.findLastByAssessment.withArgs(assessment.id).resolves(answer);
      targetProfileRepository.get.withArgs(1).resolves(targetProfile);
      challengeRepository.findBySkills.withArgs(targetProfile.skills).resolves(challenges);
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
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(targetProfile.skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(knowledgeElements);
    });

  });

  describe('#fetchForCompetenceEvaluations', () => {

    let answerRepository;
    let challengeRepository;
    let knowledgeElementRepository;
    let skillRepository;

    beforeEach(() => {
      answerRepository = {
        findLastByAssessment: sinon.stub(),
        findByAssessment: sinon.stub()
      };
      challengeRepository = {
        findByCompetenceId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      skillRepository = {
        findByCompetenceId: sinon.stub(),
      };
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async () => {
      // given
      const answer = domainBuilder.buildAnswer();
      const challenges = [
        domainBuilder.buildChallenge(),
      ];
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement(),
      ];
      const skills = [
        domainBuilder.buildSkill(),
      ];
      const assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement();

      answerRepository.findLastByAssessment.withArgs(assessment.id).resolves(answer);
      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengeRepository.findByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);

      // when
      const data = await dataFetcher.fetchForCompetenceEvaluations({
        assessment,
        answerRepository,
        challengeRepository,
        knowledgeElementRepository,
        skillRepository,
      });

      // then
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(knowledgeElements);
    });
  });

});
