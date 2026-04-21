import sinon from 'sinon';

import * as flash from '../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { getNextChallengeForCampaignAssessment } from '../../../../../src/evaluation/domain/usecases/get-next-challenge-for-campaign-assessment.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function () {
  describe('#get-next-challenge-for-campaign-assessment', function () {
    describe('when no assessment method is defined', function () {
      it('should use smart-random algorithm', async function () {
        // given
        const locale = 'fr-fr';
        const firstChallengeId = 'first_challenge';
        const secondChallengeId = 'second_challenge';
        const firstChallenge = domainBuilder.buildChallenge({ id: firstChallengeId });
        const secondChallenge = domainBuilder.buildChallenge({ id: secondChallengeId });
        const assessment = domainBuilder.buildAssessment({ id: 1165 });
        const skill = domainBuilder.buildSkill();

        const answerRepository = { findByAssessment: sinon.stub() };
        const challengeRepository = { get: sinon.stub() };
        const pickChallengeService = { pickChallenge: sinon.stub() };

        challengeRepository.get.withArgs(firstChallengeId).resolves(firstChallenge);
        challengeRepository.get.withArgs(secondChallengeId).resolves(secondChallenge);

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
          challengeRepository,
          answerRepository,
          pickChallengeService,
          assessment,
          smartRandomService: smartRandomStub,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          flash,
          locale,
        });

        // then
        expect(challenge).to.deep.equal(firstChallenge);
      });
    });
  });
});
