const { sinon, expect, domainBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Controller | assessment-controller-get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let assessmentWithoutScore;
    let assessmentWithScore;
    let scoredAsssessment;
    let assessmentRepository;
    let certificationChallengeRepository;
    let usecases;
    let dependencies;

    beforeEach(function () {
      assessmentWithoutScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5,
        type: 'DEMO',
      });

      assessmentWithScore = new Assessment({
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
        getNextChallengeForCertification: sinon.stub(),
        getNextChallengeForDemo: sinon.stub(),
        getNextChallengeForCampaignAssessment: sinon.stub(),
        getNextChallengeForCompetenceEvaluation: sinon.stub(),
        getNextChallengeForPreview: sinon.stub(),
      };
      usecases.getAssessment.resolves(scoredAsssessment);
      certificationChallengeRepository = { getNextNonAnsweredChallengeByCourseId: sinon.stub() };

      dependencies = { usecases, certificationChallengeRepository, assessmentRepository };
    });

    // TODO: Que faire si l'assessment n'existe pas pas ?

    describe('when the assessment is a preview', function () {
      const PREVIEW_ASSESSMENT_ID = 245;

      it('should return a null data directly', async function () {
        // given
        assessmentRepository.get.resolves(
          new Assessment({
            id: 1,
            courseId: 'null2356871',
            userId: 5,
            estimatedLevel: 0,
            pixScore: 0,
            type: 'PREVIEW',
          })
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
        usecases.getNextChallengeForCertification.rejects(new AssessmentEndedError());
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

    describe('when the assessment is a certification assessment', function () {
      let certificationAssessment;

      beforeEach(function () {
        certificationAssessment = new Assessment({
          id: 'assessmentId',
          type: Assessment.types.CERTIFICATION,
        });
        assessmentRepository.get.resolves(certificationAssessment);
      });

      it('should call getNextChallengeForCertificationCourse in assessmentService', async function () {
        // given
        usecases.getNextChallengeForCertification.resolves();

        // when
        await assessmentController.getNextChallenge({ params: { id: 12 } }, null, dependencies);

        // then
        expect(usecases.getNextChallengeForCertification).to.have.been.calledOnce;
        expect(usecases.getNextChallengeForCertification).to.have.been.calledWith({
          assessment: certificationAssessment,
        });
      });

      it('should reply null data when unable to find the next challenge', async function () {
        // given
        usecases.getNextChallengeForCertification.rejects(new AssessmentEndedError());

        // when
        const response = await assessmentController.getNextChallenge({ params: { id: 12 } }, null, dependencies);

        // then
        expect(response).to.deep.equal({ data: null });
      });
    });

    describe('when the assessment is a campaign assessment', function () {
      const defaultLocale = FRENCH_FRANCE;
      const assessment = new Assessment({
        id: 1,
        courseId: 'courseId',
        userId: 5,
        type: 'CAMPAIGN',
      });

      beforeEach(function () {
        assessmentRepository.get.resolves(assessment);
      });

      it('should call the usecase getNextChallengeForCampaignAssessment', async function () {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 } }, null, dependencies);

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWith({
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
          dependencies
        );

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWith({
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
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
              'accept-language': locale,
            },
          };
          // when
          await assessmentController.getNextChallenge(request, null, dependencies);

          // then
          expect(usecases.getNextChallengeForCompetenceEvaluation).to.have.been.calledWith({
            assessment,
            userId,
            locale,
          });
        });

        describe('when asking for a challenge', function () {
          const now = new Date('2019-01-01T05:06:07Z');
          let clock;

          beforeEach(function () {
            clock = sinon.useFakeTimers(now);
          });

          afterEach(function () {
            clock.restore();
          });

          it('should call assessmentRepository updateLastQuestionDate method with currentDate', async function () {
            // given
            const locale = FRENCH_SPOKEN;
            const request = {
              params: { id: 1 },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(1),
                'accept-language': locale,
              },
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
              headers: {
                authorization: generateValidRequestAuthorizationHeader(1),
                'accept-language': locale,
              },
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
