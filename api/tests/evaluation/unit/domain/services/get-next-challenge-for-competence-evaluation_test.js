import sinon from 'sinon';

import { getNextChallengeForCompetenceEvaluation } from '../../../../../src/evaluation/domain/services/get-next-challenge-for-competence-evaluation.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | Services | get-next-challenge-for-competence-evaluation', function () {
  describe('#getNextChallengeForCompetenceEvaluation', function () {
    let userId,
      assessmentId,
      competenceId,
      assessment,
      lastAnswer,
      challenges,
      targetSkills,
      locale,
      pickChallengeService,
      recentKnowledgeElements,
      actualComputedChallengeId,
      challengeUrl21,
      challengeUrl22,
      algorithmDataFetcherServiceStub,
      smartRandomStub;

    beforeEach(async function () {
      userId = 'dummyUserId';
      competenceId = 'dummyCompetenceId';
      assessmentId = 24;

      assessment = { id: assessmentId, userId, competenceId };
      challenges = [];
      targetSkills = [];
      lastAnswer = null;
      locale = 'fr';

      recentKnowledgeElements = [
        { createdAt: 4, skillId: 'url2' },
        { createdAt: 2, skillId: 'web1' },
      ];

      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      web2.challenges = [
        domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_web2_1' }),
        domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_web2_2' }),
      ];
      const url2 = domainBuilder.buildSkill({ name: '@url2' });
      challengeUrl21 = domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_url2_1' });
      challengeUrl22 = domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_url2_2' });
      url2.challenges = [challengeUrl21, challengeUrl22];
      const search2 = domainBuilder.buildSkill({ name: '@search2' });
      search2.challenges = [
        domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_search2_1' }),
        domainBuilder.evaluation.buildSmartRandomChallenge({ id: 'challenge_search2_2' }),
      ];

      algorithmDataFetcherServiceStub = {
        fetchForCompetenceEvaluations: sinon.stub(),
      };
      pickChallengeService = { pickChallenge: sinon.stub() };
      pickChallengeService.pickChallenge.returns(challengeUrl22);
      algorithmDataFetcherServiceStub.fetchForCompetenceEvaluations.resolves({
        allAnswers: [lastAnswer],
        lastAnswer: lastAnswer,
        targetSkills,
        challenges,
        knowledgeElements: recentKnowledgeElements,
      });
      smartRandomStub = {
        getPossibleSkillsForNextChallenge: sinon.stub().returns({
          hasAssessmentEnded: false,
          possibleSkillsForNextChallenge: [web2, url2, search2],
        }),
      };
    });

    context('when user is related to assessment', function () {
      beforeEach(async function () {
        actualComputedChallengeId = await getNextChallengeForCompetenceEvaluation({
          assessment,
          userId,
          pickChallengeService,
          locale,
          smartRandomService: smartRandomStub,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
        });
      });

      it('should have called the smart random with whatever returned by the data fetcher', function () {
        const allAnswers = [lastAnswer];
        expect(smartRandomStub.getPossibleSkillsForNextChallenge).to.have.been.calledWithExactly({
          allAnswers,
          lastAnswer,
          challenges,
          targetSkills,
          knowledgeElements: recentKnowledgeElements,
          locale,
        });
      });

      it('should have returned the next challenge id', function () {
        expect(actualComputedChallengeId).to.equal(challengeUrl22.id);
      });
    });
  });
});
