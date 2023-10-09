import * as flash from '../../../../lib/domain/services/algorithm-methods/flash.js';
import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';
import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getNextChallengeForCampaignAssessment } from '../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';
import { config } from '../../../../lib/config.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function () {
  describe('#get-next-challenge-for-campaign-assessment', function () {
    let challengeRepository;
    let answerRepository;
    let flashAssessmentResultRepository;
    let pickChallengeService;

    let assessment;
    let firstChallenge;
    let secondChallenge;

    beforeEach(function () {
      firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge' });
      secondChallenge = domainBuilder.buildChallenge({ id: 'second_challenge' });
      assessment = domainBuilder.buildAssessment({ id: 1165 });

      answerRepository = { findByAssessment: sinon.stub() };
      challengeRepository = { get: sinon.stub() };
      challengeRepository.get.withArgs('first_challenge').resolves(firstChallenge);
      challengeRepository.get.withArgs('second_challenge').resolves(secondChallenge);
      flashAssessmentResultRepository = Symbol('flashAssessmentResultRepository');
      pickChallengeService = { pickChallenge: sinon.stub(), chooseNextChallenge: sinon.stub() };
    });

    describe('when no assessment method is defined', function () {
      it('should use smart-random algorithm', async function () {
        // given
        const locale = 'fr-fr';
        const skill = domainBuilder.buildSkill();
        const possibleSkillsForNextChallenge = [skill];
        const smartRandomStub = {
          getPossibleSkillsForNextChallenge: sinon
            .stub()
            .returns({ possibleSkillsForNextChallenge, hasAssessmentEnded: false }),
        };
        const algorithmDataFetcherServiceStub = {
          fetchForCampaigns: sinon.stub().resolves({}),
        };

        const pickChallengeService = {
          pickChallenge: sinon.stub(),
        };

        pickChallengeService.pickChallenge
          .withArgs({ skills: possibleSkillsForNextChallenge, locale, randomSeed: assessment.id })
          .returns(firstChallenge);

        // when
        const challenge = await getNextChallengeForCampaignAssessment({
          challengeRepository,
          answerRepository,
          flashAssessmentResultRepository,
          pickChallengeService,
          assessment,
          smartRandom: smartRandomStub,
          algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          flash,
          locale,
        });

        // then
        expect(challenge).to.deep.equal(firstChallenge);
      });
    });

    describe('when assessment method is flash', function () {
      let firstSkill;
      let secondSkill;
      let thirdChallenge;
      let firstChallenge;
      let secondChallenge;
      let answerForFirstChallenge;
      let locale;

      beforeEach(function () {
        firstSkill = domainBuilder.buildSkill({ id: 'First', tubeId: '1' });
        secondSkill = domainBuilder.buildSkill({ id: 'Second', tubeId: '2' });
        firstChallenge = domainBuilder.buildChallenge({
          id: '1234',
          difficulty: -5,
          discriminant: 1,
          skill: firstSkill,
        });
        secondChallenge = domainBuilder.buildChallenge({
          id: '5678',
          difficulty: -5,
          discriminant: 1,
          skill: secondSkill,
        });

        thirdChallenge = domainBuilder.buildChallenge({
          id: '56789',
          difficulty: 1,
          discriminant: 1,
          skill: secondSkill,
        });

        answerForFirstChallenge = domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: '1234' });
        locale = 'fr-fr';
        assessment.method = 'FLASH';
      });

      describe('when there is one remaining challenge', function () {
        it('should return the best next challenges', async function () {
          // given
          const challenges = [firstChallenge, secondChallenge];

          const algorithmDataFetcherServiceStub = {
            fetchForFlashCampaigns: sinon.stub(),
          };

          const chooseNextChallenge = sinon.stub();

          chooseNextChallenge
            .withArgs({
              possibleChallenges: [secondChallenge],
            })
            .returns(secondChallenge);

          pickChallengeService.chooseNextChallenge.withArgs(assessment.id).returns(chooseNextChallenge);

          algorithmDataFetcherServiceStub.fetchForFlashCampaigns
            .withArgs({
              assessmentId: assessment.id,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              locale,
            })
            .resolves({
              allAnswers: [answerForFirstChallenge],
              challenges,
            });

          // when
          const bestChallenge = await getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          });

          // then
          expect(bestChallenge).to.deep.equal(secondChallenge);
        });
      });

      describe('when there are multiple remaining challenges', function () {
        it('should return the best next challenges', async function () {
          // given
          const algorithmDataFetcherServiceStub = {
            fetchForFlashCampaigns: sinon.stub(),
          };

          algorithmDataFetcherServiceStub.fetchForFlashCampaigns
            .withArgs({
              assessmentId: assessment.id,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              locale,
            })
            .resolves({
              allAnswers: [answerForFirstChallenge],
              challenges: [firstChallenge, secondChallenge, thirdChallenge],
            });

          const chooseNextChallenge = sinon.stub();

          chooseNextChallenge
            .withArgs({
              possibleChallenges: [secondChallenge, thirdChallenge],
            })
            .returns(secondChallenge);

          pickChallengeService.chooseNextChallenge.withArgs(assessment.id).returns(chooseNextChallenge);

          // when
          const bestChallenge = await getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          });

          // then
          expect(bestChallenge).to.deep.equal(secondChallenge);
        });
      });

      describe('when there is no challenge left', function () {
        it('should throw an AssessmentEndedError()', async function () {
          // given
          const algorithmDataFetcherServiceStub = {
            fetchForFlashCampaigns: sinon.stub(),
          };

          algorithmDataFetcherServiceStub.fetchForFlashCampaigns
            .withArgs({
              assessmentId: assessment.id,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              locale,
            })
            .resolves({
              allAnswers: [answerForFirstChallenge],
              challenges: [firstChallenge],
            });

          // when
          const getNextChallengePromise = getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          });

          // then
          return expect(getNextChallengePromise).to.be.rejectedWith(AssessmentEndedError);
        });
      });

      describe('when the challenges to be asked number has been reached', function () {
        let numberOfChallengesForFlashMethod;

        beforeEach(function () {
          numberOfChallengesForFlashMethod = config.features.numberOfChallengesForFlashMethod;
          config.features.numberOfChallengesForFlashMethod = 1;
        });

        afterEach(function () {
          config.features.numberOfChallengesForFlashMethod = numberOfChallengesForFlashMethod;
        });

        it('should throw an AssessmentEndedError()', async function () {
          // given
          const algorithmDataFetcherServiceStub = {
            fetchForFlashCampaigns: sinon.stub(),
          };

          algorithmDataFetcherServiceStub.fetchForFlashCampaigns
            .withArgs({
              assessmentId: assessment.id,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              locale,
            })
            .resolves({
              allAnswers: [answerForFirstChallenge],
              challenges: [firstChallenge, secondChallenge],
            });

          // when
          const getNextChallengePromise = getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            algorithmDataFetcherService: algorithmDataFetcherServiceStub,
          });

          // then
          return expect(getNextChallengePromise).to.be.rejectedWith(AssessmentEndedError);
        });
      });
    });
  });
});
