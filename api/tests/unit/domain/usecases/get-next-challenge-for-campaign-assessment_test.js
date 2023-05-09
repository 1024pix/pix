const flash = require('../../../../lib/domain/services/algorithm-methods/flash');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getNextChallengeForCampaignAssessment = require('../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment');
const { AssessmentEndedError } = require("../../../../lib/domain/errors");

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
      pickChallengeService = { pickChallenge: sinon.stub() };
    });

    describe('when no assessment method is defined', () => {
      it('should use smart-random algorithm', async function () {
        // given
        const smartRandomStub = {
          getPossibleSkillsForNextChallenge: sinon
            .stub()
            .resolves({ possibleSkillsForNextChallenge: [], hasAssessmentEnded: true }),
        };
        const dataFetcherStub = {
          fetchForCampaigns: sinon.stub().resolves({}),
        };

        // when
        await getNextChallengeForCampaignAssessment({
          challengeRepository,
          answerRepository,
          flashAssessmentResultRepository,
          pickChallengeService,
          assessment,
          smartRandom: smartRandomStub,
          dataFetcher: dataFetcherStub,
          flash,
        });

        // then
        expect(smartRandomStub.getPossibleSkillsForNextChallenge).to.have.been.called;
      });
    })

    describe('when assessment method is flash', function () {
      const firstSkill = domainBuilder.buildSkill({ id: 'First' });
      const secondSkill = domainBuilder.buildSkill({ id: 'Second' });
      const firstChallenge = domainBuilder.buildChallenge({
        id: '1234',
        difficulty: -5,
        discriminant: -5,
        skill: firstSkill,
      });
      const secondChallenge = domainBuilder.buildChallenge({
        id: '5678',
        difficulty: -5,
        discriminant: -5,
        skill: secondSkill,
      });
      const answerForFirstChallenge = domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: '1234' })
      const locale = 'fr-fr';

      // given
      beforeEach(function() {
        assessment.method = 'FLASH';
      })

      describe('when there are remaining challenges', function() {
        it('should return the best next challenges', async function () {
          // given
          const dataFetcherStub = {
            fetchForFlashCampaigns: sinon.stub().resolves({
              allAnswers: [answerForFirstChallenge],
              challenges: [firstChallenge, secondChallenge],
            }),
          };

          // when
          const bestChallenge = await getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            flash,
            dataFetcher: dataFetcherStub,
          });

          // then
          expect(bestChallenge).to.deep.equal(unansweredChallenge);
        });
      });

      describe('when there is no challenge left', function() {
        it('should throw an AssessmentEndedError()', async function () {
          // given
          const dataFetcherStub = {
            fetchForFlashCampaigns: sinon.stub().resolves({
              allAnswers: [answerForFirstChallenge],
              challenges: [firstChallenge],
            }),
          };

          // when
          const getNextChallengePromise = getNextChallengeForCampaignAssessment({
            challengeRepository,
            answerRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            assessment,
            locale,
            flash,
            dataFetcher: dataFetcherStub,
          });

          // then
          expect(getNextChallengePromise).to.be.rejectedWith(new AssessmentEndedError());
        });
      });
    });
  });
});
