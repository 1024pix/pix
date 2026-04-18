import * as flash from '../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { getNextChallengeForCampaignAssessment } from '../../../../../src/evaluation/domain/usecases/get-next-challenge-for-campaign-assessment.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function () {
  describe('#get-next-challenge-for-campaign-assessment', function () {
    describe('when no assessment method is defined', function () {
      it('should use smart-random algorithm', async function () {
        // given
        const locale = 'fr-fr';
        const firstChallengeId = 'first_challenge';
        const firstChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ id: firstChallengeId });
        const finalChallenge = domainBuilder.evaluation.buildChallengeToPlay({ id: firstChallenge.id });
        const assessment = domainBuilder.buildAssessment({ id: 1165 });
        const skill = domainBuilder.buildSkill();

        const answerRepository = { findByAssessment: sinon.stub() };
        const challengeToPlayRepository = { get: sinon.stub() };
        const pickChallengeService = { pickChallenge: sinon.stub() };

        challengeToPlayRepository.get.withArgs(firstChallengeId).resolves(finalChallenge);

        const possibleSkillsForNextChallenge = [skill];
        const smartRandomStub = {
          getPossibleSkillsForNextChallenge: sinon
            .stub()
            .returns({ possibleSkillsForNextChallenge, hasAssessmentEnded: false }),
        };
        const algorithmDataFetcherServiceStub = {
          fetchForCampaigns: sinon.stub().resolves({}),
        };

        pickChallengeService.pickChallenge
          .withArgs({ skills: possibleSkillsForNextChallenge, locale, randomSeed: assessment.id })
          .returns(firstChallenge);

        // when
        const challenge = await getNextChallengeForCampaignAssessment({
          challengeToPlayRepository,
          answerRepository,
          pickChallengeService,
          assessment,
          smartRandomService: smartRandomStub,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          flash,
          locale,
        });

        // then
        expect(challenge).to.deep.equal(finalChallenge);
      });
    });
  });
});
