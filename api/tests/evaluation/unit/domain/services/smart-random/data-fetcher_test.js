import sinon from 'sinon';

import * as dataFetcher from '../../../../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | services | smart-random | dataFetcher', function () {
  describe('#fetchForCampaigns', function () {
    let answerRepository;
    let campaignRepository;
    let smartRandomChallengeRepository;
    let knowledgeStateForParticipationService;
    let knowledgeStateRepository;
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
      knowledgeStateForParticipationService = {
        findByUserOrCampaignParticipationId: sinon.stub(),
      };
      knowledgeStateRepository = {
        findByUserId: sinon.stub(),
      };
      campaignParticipationRepository = {
        isRetrying: sinon.stub(),
      };
      improvementService = {
        improveKnowledgeState: sinon.stub(),
      };
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and the improved knowledge state on campaign by default', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        campaignParticipationId: 1,
        userId: 5678899,
        isImproving: false,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeState = Symbol('knowledgeState');
      const skills = Symbol('skills');
      const isRetrying = false;
      const improvedKnowledgeState = Symbol('improvedKnowledgeState');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(skills);
      smartRandomChallengeRepository.findOperativeBySkillsAndLocales.resolves(challenges);
      knowledgeStateForParticipationService.findByUserOrCampaignParticipationId
        .withArgs({
          userId: assessment.userId,
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(knowledgeState);
      campaignParticipationRepository.isRetrying
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(isRetrying);
      improvementService.improveKnowledgeState
        .withArgs({
          knowledgeState,
          isRetrying,
          isImproving: true,
          createdAt: assessment.createdAt,
          isFromCampaign: true,
        })
        .resolves(improvedKnowledgeState);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        campaignRepository,
        smartRandomChallengeRepository,
        knowledgeStateForParticipationService,
        knowledgeStateRepository,
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
      expect(data.knowledgeState).to.deep.equal(improvedKnowledgeState);
    });

    it('fetches answers, lastAnswer, targetsSkills challenges and the improved knowledge state on campaign is Retrying', async function () {
      // given
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({
        state: 'started',
        campaignParticipationId: 1,
        userId: 5678899,
        isImproving: false,
      });
      const answer = Symbol('answer');
      const challenges = Symbol('challenge');
      const knowledgeState = Symbol('knowledgeState');
      const skills = Symbol('skills');
      const isRetrying = true;
      const improvedKnowledgeState = Symbol('improvedKnowledgeState');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      campaignRepository.findSkillsByCampaignParticipationId
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(skills);
      smartRandomChallengeRepository.findOperativeBySkillsAndLocales.withArgs(skills).resolves(challenges);
      knowledgeStateForParticipationService.findByUserOrCampaignParticipationId
        .withArgs({
          userId: assessment.userId,
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(knowledgeState);
      campaignParticipationRepository.isRetrying
        .withArgs({
          campaignParticipationId: assessment.campaignParticipationId,
        })
        .resolves(isRetrying);
      improvementService.improveKnowledgeState
        .withArgs({
          knowledgeState,
          isFromCampaign: true,
          isRetrying,
          createdAt: assessment.createdAt,
          isImproving: true,
        })
        .resolves(improvedKnowledgeState);

      // when
      const data = await dataFetcher.fetchForCampaigns({
        assessment,
        answerRepository,
        campaignRepository,
        smartRandomChallengeRepository,
        knowledgeStateForParticipationService,
        knowledgeStateRepository,
        campaignParticipationRepository,
        improvementService,
        locale: 'fr-fr',
      });

      // then
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeState).to.deep.equal(improvedKnowledgeState);
    });
  });

  describe('#fetchForCompetenceEvaluations', function () {
    let answerRepository;
    let smartRandomChallengeRepository;
    let knowledgeStateRepository;
    let skillRepository;
    let improvementService;
    let data;
    let answer;
    let knowledgeState;
    let improvedKnowledgeState;
    let skills;
    let challenges;

    beforeEach(async function () {
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      smartRandomChallengeRepository = {
        findValidatedByCompetenceId: sinon.stub(),
      };
      knowledgeStateRepository = {
        findByUserId: sinon.stub(),
      };
      skillRepository = {
        findActiveByCompetenceId: sinon.stub(),
      };
      improvementService = {
        improveKnowledgeState: sinon.stub(),
      };

      answer = domainBuilder.buildAnswer();
      challenges = [domainBuilder.evaluation.buildSmartRandomChallenge()];
      knowledgeState = domainBuilder.buildKnowledgeState();
      skills = [domainBuilder.buildSkill()];
      const assessment = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation({
        isImproving: true,
      });
      improvedKnowledgeState = Symbol('improvedKnowledgeState');

      answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      smartRandomChallengeRepository.findValidatedByCompetenceId.withArgs(assessment.competenceId).resolves(challenges);
      knowledgeStateRepository.findByUserId.withArgs({ userId: assessment.userId }).resolves(knowledgeState);
      improvementService.improveKnowledgeState
        .withArgs({
          knowledgeState,
          isRetrying: false,
          isFromCampaign: false,
          isImproving: assessment.isImproving,
          createdAt: assessment.createdAt,
        })
        .resolves(improvedKnowledgeState);

      // when
      data = await dataFetcher.fetchForCompetenceEvaluations({
        assessment,
        answerRepository,
        smartRandomChallengeRepository,
        knowledgeStateRepository,
        skillRepository,
        improvementService,
      });
    });

    it('filter knowledge elements if assessment is an improving one', async function () {
      // then
      expect(improvementService.improveKnowledgeState).to.be.called;
    });

    it('fetches answers, targetsSkills challenges and knowledge state', async function () {
      // then
      expect(data.lastAnswer).to.deep.equal(answer);
      expect(data.allAnswers).to.deep.equal([answer]);
      expect(data.targetSkills).to.deep.equal(skills);
      expect(data.challenges).to.deep.equal(challenges);
      expect(data.knowledgeState).to.deep.equal(improvedKnowledgeState);
    });
  });
});
