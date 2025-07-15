import { ChallengeForSmartRandom } from '../../../../../../src/evaluation/domain/models/ChallengeForSmartRandom.js';
import * as dataFetcher from '../../../../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | services | smart-random | dataFetcher', function () {
  describe('#fetchForCampaigns', function () {
    let answerRepository;
    let campaignRepository;
    let challengesAPI;
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
      challengesAPI = {
        findOperativeBySkills: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserIdForCampaignParticipation: sinon.stub(),
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
      const challenges = [{ id: 'chal1' }, { id: 'chal2' }];
      const knowledgeElements = Symbol('knowledgeElements');
      const skills = Symbol('skills');
      const isRetrying = Symbol('isRetrying');
      const filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
        .resolves(skills);
      challengesAPI.findOperativeBySkills.withArgs(skills).resolves(challenges);
      knowledgeElementRepository.findUniqByUserIdForCampaignParticipation
        .withArgs({ userId: assessment.userId, campaignParticipationId: assessment.campaignParticipationId })
        .resolves(knowledgeElements);
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
        challengesAPI,
        knowledgeElementRepository,
        campaignParticipationRepository,
        improvementService,
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deepEqualInstance([
        new ChallengeForSmartRandom({ id: 'chal1' }),
        new ChallengeForSmartRandom({ id: 'chal2' }),
      ]);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });
  });

  describe('#fetchForCompetenceEvaluations', function () {
    let answerRepository;
    let challengesAPI;
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
      challengesAPI = {
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
      challenges = [{ id: 'chal1' }, { id: 'chal2' }];
      knowledgeElements = [domainBuilder.buildKnowledgeElement()];
      skills = [domainBuilder.buildSkill()];
      const assessment = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation();
      filteredKnowledgeElements = Symbol('filteredKnowledgeElements');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengesAPI.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeElements);
      improvementService.filterKnowledgeElementsIfImproving
        .withArgs({ knowledgeElements, assessment, isRetrying: false })
        .resolves(filteredKnowledgeElements);

      // when
      data = await dataFetcher.fetchForCompetenceEvaluations({
        assessment,
        answerRepository,
        challengesAPI,
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
      expect(data.challenges).to.deepEqualInstance([
        new ChallengeForSmartRandom({ id: 'chal1' }),
        new ChallengeForSmartRandom({ id: 'chal2' }),
      ]);
      expect(data.knowledgeElements).to.deep.equal(filteredKnowledgeElements);
    });
  });
});
