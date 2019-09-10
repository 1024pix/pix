const { sinon, expect, domainBuilder } = require('../../../../test-helper');
const dataFetcher = require('../../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | Domain | services | smart-random | dataFetcher', () => {

  describe('#fetchForCampaigns', () => {

    let answerRepository;
    let targetProfileRepository;
    let challengeRepository;
    let knowledgeElementRepository;

    beforeEach(() => {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      targetProfileRepository = {
        get: sinon.stub(),
      };
      challengeRepository = {
        findBySkills: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
    });

    it('fetches answers, targetsSkills challenges and knowledgeElements', async () => {
      // given
      const answers = [
        domainBuilder.buildAnswer(),
      ];
      const challenges = [
        domainBuilder.buildChallenge(),
      ];
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement(),
      ];
      const targetProfile = domainBuilder.buildTargetProfile();
      const assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement();

      assessment.campaignParticipation.getTargetProfileId = () => 1;
      answerRepository.findByAssessment.withArgs(assessment.id).resolves(answers);
      targetProfileRepository.get.withArgs(1).resolves(targetProfile);
      challengeRepository.findBySkills.withArgs(targetProfile.skills).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        targetProfileRepository,
        challengeRepository,
        knowledgeElementRepository,
      });

      // then
      expect(data.answers).to.deep.equal(answers);
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
        findByAssessment: sinon.stub(),
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
      const answers = [
        domainBuilder.buildAnswer(),
      ];
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

      answerRepository.findByAssessment.withArgs(assessment.id).resolves(answers);
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
      expect(data.answers).to.deep.equal(answers);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeElements).to.deep.equal(knowledgeElements);
    });
  });

});
