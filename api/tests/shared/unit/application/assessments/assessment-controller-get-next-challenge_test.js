import { usecases as certificationEvaluationUsecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { assessmentController } from '../../../../../src/shared/application/assessments/assessment-controller.js';
import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder, expect, generateAuthenticatedUserRequestHeaders, sinon } from '../../../../test-helper.js';

const { FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;

describe('Unit | Controller | assessment-controller-get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let assessmentRepository;
    let assessmentWithoutScore;
    let assessmentWithScore;
    let certificationChallengeRepository;
    let certificationVersionRepository;
    let dependencies;
    let scoredAsssessment;
    let usecases;

    beforeEach(function () {
      assessmentWithoutScore = domainBuilder.buildAssessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5,
        type: 'DEMO',
      });

      assessmentWithScore = domainBuilder.buildAssessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
      });

      scoredAsssessment = {
        assessmentPix: assessmentWithScore,
      };

      assessmentRepository = {
        get: sinon.stub(),
        updateLastQuestionDate: sinon.stub(),
        updateWhenNewChallengeIsAsked: sinon.stub(),
      };

      usecases = {
        getAssessment: sinon.stub(),
        getNextChallengeForDemo: sinon.stub(),
        getNextChallengeForCampaignAssessment: sinon.stub(),
        getNextChallengeForCompetenceEvaluation: sinon.stub(),
        getNextChallengeForPreview: sinon.stub(),
      };
      usecases.getAssessment.resolves(scoredAsssessment);
      certificationChallengeRepository = { getNextNonAnsweredChallengeByCourseId: sinon.stub() };
      certificationVersionRepository = { getByCertificationCourseId: sinon.stub() };

      dependencies = {
        usecases,
        certificationChallengeRepository,
        assessmentRepository,
        certificationVersionRepository,
      };

      sinon.stub(certificationEvaluationUsecases, 'getNextChallengeForV2Certification');
      sinon.stub(certificationEvaluationUsecases, 'getNextChallenge');
    });

    describe('when the assessment is a preview', function () {
      const PREVIEW_ASSESSMENT_ID = 245;

      it('should return a null data directly', async function () {
        // given
        assessmentRepository.get.resolves(
          domainBuilder.buildAssessment({
            id: 1,
            courseId: 'null2356871',
            userId: 5,
            estimatedLevel: 0,
            pixScore: 0,
            type: 'PREVIEW',
          }),
        );

        const request = { params: { id: PREVIEW_ASSESSMENT_ID } };
        usecases.getNextChallengeForPreview.returns(null);

        // when
        const response = await assessmentController.getNextChallenge(request, null, dependencies);

        // then
        expect(response).to.deep.equal({ data: null });
      });
    });

    describe('when the assessment is over', function () {
      beforeEach(function () {
        certificationEvaluationUsecases.getNextChallengeForV2Certification.rejects(new AssessmentEndedError());
        usecases.getNextChallengeForDemo.rejects(new AssessmentEndedError());
        assessmentRepository.get.resolves(assessmentWithoutScore);
        usecases.getAssessment.resolves(scoredAsssessment);
      });

      context('when the assessment is a DEMO', function () {
        it('should reply with no data', async function () {
          // when
          const response = await assessmentController.getNextChallenge({ params: { id: 7531 } }, null, dependencies);

          // then
          expect(response).to.deep.equal({ data: null });
        });
      });
    });

    describe('when the assessment is not over yet', function () {
      let newChallenge;

      beforeEach(function () {
        newChallenge = { id: 345 };

        assessmentRepository.get.resolves(assessmentWithoutScore);
        usecases.getNextChallengeForDemo.resolves(newChallenge);
      });

      it('should not evaluate assessment score', async function () {
        // when
        await assessmentController.getNextChallenge({ params: { id: 7531 } }, null, dependencies);

        // then
        expect(usecases.getAssessment).not.to.have.been.called;
      });

      it('should update information when new challenge is asked', async function () {
        // given
        const request = { params: { id: assessmentWithoutScore.id } };

        // when
        await assessmentController.getNextChallenge(request, null, dependencies);

        // then
        expect(assessmentRepository.updateWhenNewChallengeIsAsked).to.be.calledWith({
          id: assessmentWithoutScore.id,
          lastChallengeId: newChallenge.id,
        });
      });

      it('should not update information when new challenge is the same than actual challenge', async function () {
        // given
        assessmentWithoutScore.lastChallengeId = newChallenge.id;
        assessmentRepository.get.resolves(assessmentWithoutScore);

        // when
        await assessmentController.getNextChallenge({ params: { id: assessmentWithoutScore.id } }, null, dependencies);

        // then
        expect(assessmentRepository.updateWhenNewChallengeIsAsked).to.not.have.been.called;
      });
    });

    describe('when the assessment is a campaign assessment', function () {
      const defaultLocale = FRENCH_FRANCE;
      let assessment;

      beforeEach(function () {
        assessment = domainBuilder.buildAssessment.ofTypeCampaign({
          id: 1,
          courseId: 'courseId',
          userId: 5,
        });

        assessmentRepository.get.withArgs(1).resolves(assessment);
      });

      it('should call the usecase getNextChallengeForCampaignAssessment', async function () {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 } }, null, dependencies);

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWithExactly({
          assessment,
          locale: defaultLocale,
        });
      });

      it('should call the usecase getNextChallengeForCampaignAssessment with the locale', async function () {
        // given
        const locale = FRENCH_SPOKEN;

        // when
        await assessmentController.getNextChallenge(
          {
            params: { id: 1 },
            headers: {
              'accept-language': locale,
            },
          },
          null,
          dependencies,
        );

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWithExactly({
          assessment,
          locale,
        });
      });
    });

    describe('when the assessment is a competence evaluation assessment', function () {
      describe('when assessment is started', function () {
        const userId = 1;
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            id: 1,
            courseId: 'courseId',
            userId: 5,
            type: Assessment.types.COMPETENCE_EVALUATION,
            state: 'started',
          });
          assessmentRepository.get.resolves(assessment);
        });

        it('should call the usecase getNextChallengeForCompetenceEvaluation', async function () {
          const locale = FRENCH_SPOKEN;
          const request = {
            params: { id: 1 },
            headers: generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: locale }),
          };
          // when
          await assessmentController.getNextChallenge(request, null, dependencies);

          // then
          expect(usecases.getNextChallengeForCompetenceEvaluation).to.have.been.calledWithExactly({
            assessment,
            userId,
            locale,
          });
        });

        describe('when asking for a challenge', function () {
          let now;
          let clock;

          beforeEach(function () {
            clock = sinon.useFakeTimers({ now: new Date('2019-01-01T05:06:07Z'), toFake: ['Date'] });
            now = new Date(clock.now);
          });

          afterEach(function () {
            clock.restore();
          });

          it('should call assessmentRepository updateLastQuestionDate method with currentDate', async function () {
            // given
            const locale = FRENCH_SPOKEN;
            const request = {
              params: { id: 1 },
              headers: generateAuthenticatedUserRequestHeaders({ userId: 1, locale }),
            };

            // when
            await assessmentController.getNextChallenge(request, null, dependencies);

            // then
            expect(assessmentRepository.updateLastQuestionDate).to.be.calledWith({
              id: request.params.id,
              lastQuestionDate: now,
            });
          });
        });
      });

      describe('when assessment is completed', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            id: 1,
            courseId: 'courseId',
            userId: 5,
            // TODO: Fix this the next time the file is edited.

            type: Assessment.types.COMPETENCE_EVALUATION,
            state: 'completed',
          });
          assessmentRepository.get.resolves(assessment);
        });

        describe('#getNextChallenge', function () {
          it('should not call assessmentRepository updateLastQuestionDate method', async function () {
            // given
            const locale = FRENCH_SPOKEN;
            const request = {
              params: { id: 1 },
              headers: generateAuthenticatedUserRequestHeaders({ userId: 1, locale }),
            };

            // when
            await assessmentController.getNextChallenge(request, null, dependencies);

            // then
            expect(assessmentRepository.updateLastQuestionDate).to.have.not.been.called;
          });
        });
      });
    });
  });
});
