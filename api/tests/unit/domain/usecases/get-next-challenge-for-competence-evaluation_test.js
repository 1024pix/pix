import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';
import getNextChallengeForCompetenceEvaluation from '../../../../lib/domain/usecases/get-next-challenge-for-competence-evaluation';
import smartRandom from '../../../../lib/domain/services/algorithm-methods/smart-random';

describe('Unit | Domain | Use Cases | get-next-challenge-for-competence-evaluation', function () {
  describe('#getNextChallengeForCompetenceEvaluation', function () {
    let userId,
      assessmentId,
      competenceId,
      assessment,
      lastAnswer,
      challenges,
      targetSkills,
      locale,
      answerRepository,
      challengeRepository,
      skillRepository,
      knowledgeElementRepository,
      pickChallengeService,
      recentKnowledgeElements,
      actualComputedChallenge,
      challengeUrl21,
      challengeUrl22,
      improvementService;

    beforeEach(async function () {
      userId = 'dummyUserId';
      competenceId = 'dummyCompetenceId';
      assessmentId = 24;

      assessment = { id: assessmentId, userId, competenceId };
      challenges = [];
      targetSkills = [];
      lastAnswer = null;
      locale = 'fr';

      answerRepository = { findByAssessment: sinon.stub().resolves([lastAnswer]) };
      challengeRepository = { findValidatedByCompetenceId: sinon.stub().resolves(challenges) };
      skillRepository = { findActiveByCompetenceId: sinon.stub().resolves(targetSkills) };
      pickChallengeService = { pickChallenge: sinon.stub().resolves(challengeUrl22) };

      recentKnowledgeElements = [
        { createdAt: 4, skillId: 'url2' },
        { createdAt: 2, skillId: 'web1' },
      ];
      knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves(recentKnowledgeElements) };
      improvementService = { filterKnowledgeElementsIfImproving: sinon.stub().resolves(recentKnowledgeElements) };

      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      web2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_web2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_web2_2' }),
      ];
      const url2 = domainBuilder.buildSkill({ name: '@url2' });
      challengeUrl21 = domainBuilder.buildChallenge({ id: 'challenge_url2_1' });
      challengeUrl22 = domainBuilder.buildChallenge({ id: 'challenge_url2_2' });
      url2.challenges = [challengeUrl21, challengeUrl22];
      const search2 = domainBuilder.buildSkill({ name: '@search2' });
      search2.challenges = [
        domainBuilder.buildChallenge({ id: 'challenge_search2_1' }),
        domainBuilder.buildChallenge({ id: 'challenge_search2_2' }),
      ];

      sinon.stub(smartRandom, 'getPossibleSkillsForNextChallenge').returns({
        hasAssessmentEnded: false,
        possibleSkillsForNextChallenge: [web2, url2, search2],
      });
    });

    context('when user is not related to assessment', function () {
      let requestErr;
      beforeEach(async function () {
        requestErr = await catchErr(getNextChallengeForCompetenceEvaluation)({
          assessment,
          userId: userId + 1,
          answerRepository,
          challengeRepository,
          knowledgeElementRepository,
          skillRepository,
          pickChallengeService,
          improvementService,
          locale,
        });
      });
      it('should throw a UserNotAuthorizedToAccessEntityError error', function () {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });

    context('when user is related to assessment', function () {
      beforeEach(async function () {
        actualComputedChallenge = await getNextChallengeForCompetenceEvaluation({
          assessment,
          userId,
          answerRepository,
          challengeRepository,
          knowledgeElementRepository,
          skillRepository,
          pickChallengeService,
          improvementService,
          locale,
        });
      });
      it('should have fetched the answers', function () {
        expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
      });

      it('should have fetched the most recent knowledge elements', function () {
        expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({ userId });
      });

      it('should have fetched the challenges', function () {
        expect(challengeRepository.findValidatedByCompetenceId).to.have.been.calledWithExactly(competenceId);
      });

      it('should have fetched the next challenge with only most recent knowledge elements', function () {
        const allAnswers = [lastAnswer];
        expect(smartRandom.getPossibleSkillsForNextChallenge).to.have.been.calledWithExactly({
          allAnswers,
          lastAnswer,
          challenges,
          targetSkills,
          knowledgeElements: recentKnowledgeElements,
          locale,
        });
      });

      it('should have returned the next challenge', function () {
        expect(actualComputedChallenge.id).to.equal(challengeUrl22.id);
      });
    });
  });
});
