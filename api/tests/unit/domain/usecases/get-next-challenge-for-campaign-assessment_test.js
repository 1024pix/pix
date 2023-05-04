import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getNextChallengeForCampaignAssessment } from '../../../../lib/domain/usecases/get-next-challenge-for-campaign-assessment.js';

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
      const flashStub = {
        getPossibleNextChallenges: sinon.stub().returns(),
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
        flash: flashStub,
      });

      // then
      expect(smartRandomStub.getPossibleSkillsForNextChallenge).to.have.been.called;
    });

    describe('when assessment method is flash', function () {
      it('should use flash algorithm', async function () {
        // given
        assessment.method = 'FLASH';
        const flashStub = {
          getPossibleNextChallenges: sinon.stub().returns({ possibleChallenges: [], hasAssessmentEnded: false }),
        };
        const dataFetcherStub = {
          fetchForFlashCampaigns: sinon.stub().resolves({}),
        };
        const smartRandomStub = {
          getPossibleSkillsForNextChallenge: sinon.stub().resolves(),
        };
        const locale = 'fr-fr';

        // when
        await getNextChallengeForCampaignAssessment({
          challengeRepository,
          answerRepository,
          flashAssessmentResultRepository,
          pickChallengeService,
          assessment,
          locale,
          flash: flashStub,
          dataFetcher: dataFetcherStub,
          smartRandom: smartRandomStub,
        });

        // then
        expect(flashStub.getPossibleNextChallenges).to.have.been.called;
        expect(dataFetcherStub.fetchForFlashCampaigns).to.have.been.calledWith({
          assessmentId: assessment.id,
          answerRepository,
          challengeRepository,
          flashAssessmentResultRepository,
          locale,
        });
      });
    });
  });
});
