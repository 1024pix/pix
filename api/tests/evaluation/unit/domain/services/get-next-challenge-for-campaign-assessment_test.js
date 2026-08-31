import { expect } from 'chai';
import sinon from 'sinon';

import * as flash from '../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { getNextChallengeForCampaignAssessment } from '../../../../../src/evaluation/domain/services/get-next-challenge-for-campaign-assessment.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | Services | get-next-challenge-for-campaign-assessment', function () {
  describe('#get-next-challenge-for-campaign-assessment', function () {
    describe('when no assessment method is defined', function () {
      it('should use smart-random algorithm', async function () {
        // given
        const locale = 'fr-fr';
        const firstChallengeId = 'first_challenge';
        const firstChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ id: firstChallengeId });
        const finalChallenge = domainBuilder.buildChallenge({ id: firstChallenge.id });
        const assessment = domainBuilder.buildAssessment({ id: 1165 });
        const skill = domainBuilder.buildSkill();

        const answerRepository = { findByAssessment: sinon.stub() };
        const pickChallengeService = { pickChallenge: sinon.stub() };

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
        const challengeId = await getNextChallengeForCampaignAssessment({
          answerRepository,
          pickChallengeService,
          assessment,
          smartRandomService: smartRandomStub,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          flash,
          locale,
        });

        // then
        expect(challengeId).to.deep.equal(finalChallenge.id);
      });
    });
  });
});
