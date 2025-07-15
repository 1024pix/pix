import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';
import { Statuses } from '../../../../../src/shared/domain/models/Challenge.js';
import { ChallengeToPlay } from '../../../../../src/shared/domain/models/ChallengeToPlay.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { updateAssessmentWithNextChallenge } from '../../../../../src/shared/domain/usecases/update-assessment-with-next-challenge.js';
import { domainBuilder, expect, preventStubsToBeCalledUnexpectedly, sinon } from '../../../../test-helper.js';

describe('Shared | Unit | Domain | Use Cases | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let userId, assessmentId, locale, dependencies;
    let assessmentRepository_updateLastQuestionDateStub;
    let assessmentRepository_updateWhenNewChallengeIsAskedStub;
    let challengeRepository_getStub;
    let challengesAPI_getStub;
    let challengesAPI_getWebComponentInfoForStub;
    let evaluationUsecases_getNextChallengeForPreviewStub;
    let evaluationUsecases_getNextChallengeForDemoStub;
    let evaluationUsecases_getNextChallengeForCampaignAssessmentStub;
    let evaluationUsecases_getNextChallengeForCompetenceEvaluationStub;
    let certificationEvaluationRepository_selectNextCertificationChallengeStub;

    beforeEach(function () {
      userId = 'someUserId';
      assessmentId = 'someAssessmentId';
      locale = 'someLocale';
      assessmentRepository_updateLastQuestionDateStub = sinon.stub().named('updateLastQuestionDate');
      assessmentRepository_updateWhenNewChallengeIsAskedStub = sinon.stub().named('updateWhenNewChallengeIsAsked');
      challengeRepository_getStub = sinon.stub().named('get');
      challengesAPI_getStub = sinon.stub().named('get');
      challengesAPI_getWebComponentInfoForStub = sinon.stub().named('getWebComponentInfoFor');
      evaluationUsecases_getNextChallengeForPreviewStub = sinon.stub().named('getNextChallengeForPreview');
      evaluationUsecases_getNextChallengeForDemoStub = sinon.stub().named('getNextChallengeForDemo');
      evaluationUsecases_getNextChallengeForCampaignAssessmentStub = sinon
        .stub()
        .named('getNextChallengeForCampaignAssessment');
      evaluationUsecases_getNextChallengeForCompetenceEvaluationStub = sinon
        .stub()
        .named('getNextChallengeForCompetenceEvaluation');
      certificationEvaluationRepository_selectNextCertificationChallengeStub = sinon
        .stub()
        .named('selectNextCertificationChallenge');
      preventStubsToBeCalledUnexpectedly([
        assessmentRepository_updateLastQuestionDateStub,
        assessmentRepository_updateWhenNewChallengeIsAskedStub,
        challengeRepository_getStub,
        challengesAPI_getStub,
        challengesAPI_getWebComponentInfoForStub,
        evaluationUsecases_getNextChallengeForPreviewStub,
        evaluationUsecases_getNextChallengeForDemoStub,
        evaluationUsecases_getNextChallengeForCampaignAssessmentStub,
        evaluationUsecases_getNextChallengeForCompetenceEvaluationStub,
        certificationEvaluationRepository_selectNextCertificationChallengeStub,
      ]);

      const assessmentRepository = {
        updateLastQuestionDate: assessmentRepository_updateLastQuestionDateStub,
        updateWhenNewChallengeIsAsked: assessmentRepository_updateWhenNewChallengeIsAskedStub,
      };

      const challengeRepository = {
        get: challengeRepository_getStub,
      };

      const challengesAPI = {
        get: challengesAPI_getStub,
        getWebComponentInfoFor: challengesAPI_getWebComponentInfoForStub,
      };

      const evaluationUsecases = {
        getNextChallengeForPreview: evaluationUsecases_getNextChallengeForPreviewStub,
        getNextChallengeForDemo: evaluationUsecases_getNextChallengeForDemoStub,
        getNextChallengeForCampaignAssessment: evaluationUsecases_getNextChallengeForCampaignAssessmentStub,
        getNextChallengeForCompetenceEvaluation: evaluationUsecases_getNextChallengeForCompetenceEvaluationStub,
      };

      const certificationEvaluationRepository = {
        selectNextCertificationChallenge: certificationEvaluationRepository_selectNextCertificationChallengeStub,
      };

      dependencies = {
        userId,
        locale,
        assessmentRepository,
        challengeRepository,
        evaluationUsecases,
        certificationEvaluationRepository,
        challengesAPI,
      };
    });

    context('when assessment is not started', function () {
      let assessment;

      beforeEach(function () {
        assessment = domainBuilder.buildAssessment({ id: assessmentId, type: Assessment.types.PREVIEW });
      });

      [
        Assessment.states.ABORTED,
        Assessment.states.COMPLETED,
        Assessment.states.ENDED_BY_SUPERVISOR,
        Assessment.states.ENDED_DUE_TO_FINALIZATION,
      ].forEach((assessmentState) => {
        it(`should return an assessment with its answers`, async function () {
          assessment.state = assessmentState;

          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge).to.deepEqualInstance(assessment);
          expect(assessmentWithNextChallenge.nextChallenge).to.be.null;
        });
      });
    });

    context('when assessment is started', function () {
      it('should return an Assessment', async function () {
        const assessment = domainBuilder.buildAssessment({
          state: Assessment.states.STARTED,
          type: Assessment.types.PREVIEW,
          lastChallengeId: null,
        });
        assessmentRepository_updateLastQuestionDateStub.resolves();
        assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        const challenge = domainBuilder.buildChallenge({ id: 'challengeForPreview' });
        evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);

        const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

        expect(assessmentWithNextChallenge).to.deepEqualInstance(assessment);
      });

      context('when there are no challenge saved as latest challenge asked in assessment', function () {
        it('should compute next challenge', async function () {
          const assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.CAMPAIGN,
            lastChallengeId: null,
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          evaluationUsecases_getNextChallengeForCampaignAssessmentStub.withArgs({}).resolves('nextChallengeId');
          challengesAPI_getStub
            .withArgs('nextChallengeId')
            .resolves({ id: 'nextChallengeId', instruction: 'some instruction' });
          challengesAPI_getWebComponentInfoForStub.withArgs('nextChallengeId').resolves({
            challengeId: 'nextChallengeId',
            webComponentProps: 'some webComponentProps',
            webComponentTagName: 'some webComponentTagName',
          });

          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(
            new ChallengeToPlay({
              id: 'nextChallengeId',
              instruction: 'some instruction',
              webComponentProps: 'some webComponentProps',
              webComponentTagName: 'some webComponentTagName',
            }),
          );
        });
      });

      context('when the latest challenge asked has been answered', function () {
        it('should compute next challenge', async function () {
          const assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.PREVIEW,
            lastChallengeId: 'previousChallengeId',
            answers: [domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' })],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForPreview' });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);

          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('when the latest challenge asked has not been answered yet', function () {
        context('when challenge is operative', function () {
          it('should return latest challenge', async function () {
            const assessment = domainBuilder.buildAssessment({
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
              lastChallengeId: 'previousChallengeId',
            });
            assessmentRepository_updateLastQuestionDateStub.resolves();
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            const previousChallenge = domainBuilder.buildChallenge({
              id: 'previousChallengeId',
              status: Statuses.VALIDATED,
            });
            challengeRepository_getStub.withArgs('previousChallengeId').resolves(previousChallenge);

            const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({
              assessment,
              ...dependencies,
            });

            expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(previousChallenge);
          });
        });

        context('when challenge is not operative', function () {
          it('should compute next challenge', async function () {
            const assessment = domainBuilder.buildAssessment({
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
              lastChallengeId: 'previousChallengeId',
            });
            assessmentRepository_updateLastQuestionDateStub.resolves();
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            const challenge = domainBuilder.buildChallenge({ id: 'nextChallengeForPreview' });
            const previousChallenge = domainBuilder.buildChallenge({
              id: 'previousChallengeId',
              status: Statuses.OBSOLETE,
            });
            evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);
            challengeRepository_getStub.withArgs('previousChallengeId').resolves(previousChallenge);

            const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({
              assessment,
              ...dependencies,
            });

            expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
          });
        });
      });
    });

    context('Assessment types', function () {
      context('for assessment of type PREVIEW', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.PREVIEW,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should call usecase and return value from preview usecase', async function () {
          evaluationUsecases_getNextChallengeForPreviewStub.rejects(new AssessmentEndedError());
          const assessmentWithoutChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
        });
      });

      context('for assessment of type DEMO', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.DEMO,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should call usecase and return value from demo usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForDemo' });
          evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves(challenge);
          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
        });
        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            evaluationUsecases_getNextChallengeForDemoStub.rejects(new AssessmentEndedError());

            // when
            const assessmentWithoutChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
          });
        });
      });

      context('for assessment of type CAMPAIGN', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.CAMPAIGN,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should call usecase and return value from campaign usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCampaign' });
          evaluationUsecases_getNextChallengeForCampaignAssessmentStub
            .withArgs({ assessment, locale })
            .resolves(challenge);
          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            evaluationUsecases_getNextChallengeForCampaignAssessmentStub.rejects(new AssessmentEndedError());

            // when
            const assessmentWithoutChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
          });
        });
      });

      context('for assessment of type COMPETENCE_EVALUATION', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.COMPETENCE_EVALUATION,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should call usecase and return value from competence evaluation usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCompetenceEvaluation' });
          evaluationUsecases_getNextChallengeForCompetenceEvaluationStub
            .withArgs({ assessment, userId, locale })
            .resolves(challenge);
          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            evaluationUsecases_getNextChallengeForCompetenceEvaluationStub.rejects(new AssessmentEndedError());

            // when
            const assessmentWithoutChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
          });
        });
      });

      context('for assessment of type CERTIFICATION', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: Assessment.types.CERTIFICATION,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should call usecase and return value from certification usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCertification' });
          certificationEvaluationRepository_selectNextCertificationChallengeStub
            .withArgs({ assessmentId: assessment.id, locale })
            .resolves(challenge);
          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.deepEqualInstance(challenge);
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            certificationEvaluationRepository_selectNextCertificationChallengeStub.rejects(new AssessmentEndedError());

            // when
            const assessmentWithoutChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
          });
        });
      });

      context('for assessment of type unknown', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: 'coucou les zamis',
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        it('should return null', async function () {
          const assessmentWithNextChallenge = await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentWithNextChallenge.nextChallenge).to.be.null;
        });
      });
    });

    context('Assessment updates', function () {
      context('updating last question date', function () {
        let clock;
        let assessment;

        beforeEach(function () {
          clock = sinon.useFakeTimers(new Date('2023-10-05'));
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: Assessment.types.PREVIEW,
            answers: [],
          });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves({ id: 'someChallengeId' });
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        afterEach(async function () {
          clock.restore();
        });

        it(`should update the last question date`, async function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();

          await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

          expect(assessmentRepository_updateLastQuestionDateStub).to.have.been.calledWithExactly({
            id: assessmentId,
            lastQuestionDate: new Date('2023-10-05'),
          });
        });
      });

      context('updating last challenge asked', function () {
        beforeEach(function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();
        });

        context('when no next challenge has been found', function () {
          it('should not update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
            });
            evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(null);

            await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

            expect(assessmentRepository_updateWhenNewChallengeIsAskedStub).to.not.have.been.called;
          });
        });

        context('when next challenge found is the latest challenge asked for assessment', function () {
          it('should not update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
              lastChallengeId: 'currentChallengeId',
              answers: [domainBuilder.buildAnswer({ challengeId: 'currentChallengeId' })],
            });

            evaluationUsecases_getNextChallengeForPreviewStub
              .withArgs({})
              .resolves(domainBuilder.buildChallenge({ id: 'currentChallengeId' }));

            await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

            expect(assessmentRepository_updateWhenNewChallengeIsAskedStub).to.not.have.been.called;
          });
        });

        context('when next challenge found is different from the latest challenge asked for assessment', function () {
          it('should update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
              lastChallengeId: 'previousChallengeId',
              answers: [domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' })],
            });

            evaluationUsecases_getNextChallengeForPreviewStub
              .withArgs({})
              .resolves(domainBuilder.buildChallenge({ id: 'nextChallengeId' }));
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();

            await updateAssessmentWithNextChallenge({ assessment, ...dependencies });

            expect(assessmentRepository_updateWhenNewChallengeIsAskedStub).to.have.been.calledWithExactly({
              id: assessmentId,
              lastChallengeId: 'nextChallengeId',
            });
          });
        });
      });
    });
  });
});
