import { expect } from 'chai';
import sinon from 'sinon';

import * as flash from '../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { getNextChallengeForCampaignAssessment } from '../../../../../src/evaluation/domain/services/get-next-challenge-for-campaign-assessment.js';
import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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

    describe('when assessment method is IRT', function () {
      it('should use IRT algorithm', async function () {
        const expectedChallengeId = 'expectedChallengeId';
        const currentCalibratedChallenges = [domainBuilder.buildChallenge({ id: expectedChallengeId })];
        const version = domainBuilder.certification.configuration.versionBuilder().build();

        const pickChallengeServiceStub = {
          getChallengePicker: sinon.stub().returns(sinon.stub().returns(currentCalibratedChallenges[0])),
        };

        const assessment = domainBuilder.buildAssessment({ method: Assessment.methods.IRT });
        const getByCampaignIdStub = sinon.stub().resolves(version);
        const findActiveFlashCompatibleStub = sinon.stub().returns(currentCalibratedChallenges);
        const getManyStub = sinon.stub().returns([]);

        const calibratedChallengeRepositoryStub = {
          findActiveFlashCompatible: findActiveFlashCompatibleStub,
          getMany: getManyStub,
        };
        const versionRepositoryStub = { getByCampaignId: getByCampaignIdStub };
        const flashAlgorithmServiceStub = {
          getPossibleNextChallenges: sinon.stub().returns(currentCalibratedChallenges),
          getCapacityAndErrorRate: sinon.stub().returns({ capacity: 0, errorRate: 0 }),
        };
        const algorithmDataFetcherServiceStub = {
          fetchForCampaigns: sinon.stub().resolves({ allAnswers: [] }),
        };

        const challengeId = await getNextChallengeForCampaignAssessment({
          certificationPickChallengeService: pickChallengeServiceStub,
          assessment,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          flashAlgorithmService: flashAlgorithmServiceStub,
          versionRepository: versionRepositoryStub,
          calibratedChallengeRepository: calibratedChallengeRepositoryStub,
          locale: 'fr',
        });

        expect(challengeId).to.be.equal(expectedChallengeId);
      });

      context('when there is no possible challenge left', function () {
        it('should throw assessment ended error', async function () {
          const expectedChallengeId = 'expectedChallengeId';
          const currentCalibratedChallenges = [domainBuilder.buildChallenge({ id: expectedChallengeId })];
          const version = domainBuilder.certification.configuration.versionBuilder().build();

          const assessment = domainBuilder.buildAssessment({ method: Assessment.methods.IRT });
          const getByCampaignIdStub = sinon.stub().resolves(version);
          const findActiveFlashCompatibleStub = sinon.stub().returns(currentCalibratedChallenges);
          const getManyStub = sinon.stub().returns([]);

          const calibratedChallengeRepositoryStub = {
            findActiveFlashCompatible: findActiveFlashCompatibleStub,
            getMany: getManyStub,
          };
          const versionRepositoryStub = { getByCampaignId: getByCampaignIdStub };
          const flashAlgorithmServiceStub = {
            getPossibleNextChallenges: sinon.stub().returns([]),
            getCapacityAndErrorRate: sinon.stub().returns({ capacity: 0, errorRate: 0 }),
          };
          const algorithmDataFetcherServiceStub = {
            fetchForCampaigns: sinon.stub().resolves({ allAnswers: [] }),
          };

          const error = await catchErr(getNextChallengeForCampaignAssessment)({
            assessment,
            algorithmDataFetcherService: algorithmDataFetcherServiceStub,
            flashAlgorithmService: flashAlgorithmServiceStub,
            versionRepository: versionRepositoryStub,
            calibratedChallengeRepository: calibratedChallengeRepositoryStub,
            locale: 'fr',
          });

          expect(error).to.be.instanceOf(AssessmentEndedError);
        });
      });
    });
  });
});
