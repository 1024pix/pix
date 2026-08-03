import sinon from 'sinon';

import { updateAssessmentWithNextChallenge } from '../../../../../src/evaluation/domain/usecases/update-assessment-with-next-challenge.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import {
  AssessmentEndedError,
  AssessmentLackOfChallengesError,
  CampaignParticipationDeletedError,
  NotFoundError,
} from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('Evaluation | Unit | Domain | Use Cases | update-assessment-with-next-challenge', function () {
  describe('#updateAssessmentWithNextChallenge', function () {
    const nextChallenge = Symbol('nextChallenge');
    let userId, assessmentId, locale, dependencies;
    let assessmentRepository_getWithAnswersStub;
    let assessmentRepository_updateLastQuestionDateStub;
    let assessmentRepository_updateWhenNewChallengeIsAskedStub;
    let evaluationUsecases_getNextChallengeForDemoStub;
    let evaluationUsecases_getNextChallengeForCampaignAssessmentStub;
    let evaluationUsecases_getNextChallengeForCompetenceEvaluationStub;
    let evaluationUsecases_getProgressionStub;
    let certificationEvaluationRepository_selectNextCertificationChallengeStub;
    let certificationEvaluationRepository_getAssessmentLiveAlertsStub;
    let courseRepository_getStub;
    let competenceRepository_getCompetenceNameStub;
    let challengeToPlayRepository_getStub;

    beforeEach(function () {
      userId = 'someUserId';
      assessmentId = 'someAssessmentId';
      locale = 'someLocale';
      assessmentRepository_getWithAnswersStub = sinon.stub().named('getWithAnswers');
      assessmentRepository_updateLastQuestionDateStub = sinon.stub().named('updateLastQuestionDate');
      assessmentRepository_updateWhenNewChallengeIsAskedStub = sinon.stub().named('updateWhenNewChallengeIsAsked');
      evaluationUsecases_getNextChallengeForDemoStub = sinon.stub().named('getNextChallengeForDemo');
      evaluationUsecases_getNextChallengeForCampaignAssessmentStub = sinon
        .stub()
        .named('getNextChallengeForCampaignAssessment');
      evaluationUsecases_getNextChallengeForCompetenceEvaluationStub = sinon
        .stub()
        .named('getNextChallengeForCompetenceEvaluation');
      evaluationUsecases_getProgressionStub = sinon.stub().named('getProgression');
      certificationEvaluationRepository_selectNextCertificationChallengeStub = sinon
        .stub()
        .named('selectNextCertificationChallenge');
      certificationEvaluationRepository_getAssessmentLiveAlertsStub = sinon.stub().named('getAssessmentLiveAlerts');
      courseRepository_getStub = sinon.stub().named('getCourse');
      competenceRepository_getCompetenceNameStub = sinon.stub().named('getCompetenceName');
      challengeToPlayRepository_getStub = sinon.stub().named('getChallenge');
      preventStubsToBeCalledUnexpectedly([
        assessmentRepository_getWithAnswersStub,
        assessmentRepository_updateLastQuestionDateStub,
        assessmentRepository_updateWhenNewChallengeIsAskedStub,
        evaluationUsecases_getNextChallengeForDemoStub,
        evaluationUsecases_getNextChallengeForCampaignAssessmentStub,
        evaluationUsecases_getNextChallengeForCompetenceEvaluationStub,
        evaluationUsecases_getProgressionStub,
        certificationEvaluationRepository_selectNextCertificationChallengeStub,
        certificationEvaluationRepository_getAssessmentLiveAlertsStub,
        courseRepository_getStub,
        competenceRepository_getCompetenceNameStub,
        challengeToPlayRepository_getStub,
      ]);

      const assessmentRepository = {
        getWithAnswers: assessmentRepository_getWithAnswersStub,
        updateLastQuestionDate: assessmentRepository_updateLastQuestionDateStub,
        updateWhenNewChallengeIsAsked: assessmentRepository_updateWhenNewChallengeIsAskedStub,
      };

      const evaluationUsecases = {
        getNextChallengeForDemo: evaluationUsecases_getNextChallengeForDemoStub,
        getNextChallengeForCampaignAssessment: evaluationUsecases_getNextChallengeForCampaignAssessmentStub,
        getNextChallengeForCompetenceEvaluation: evaluationUsecases_getNextChallengeForCompetenceEvaluationStub,
        getProgression: evaluationUsecases_getProgressionStub,
      };

      const certificationEvaluationRepository = {
        selectNextCertificationChallenge: certificationEvaluationRepository_selectNextCertificationChallengeStub,
        getAssessmentLiveAlerts: certificationEvaluationRepository_getAssessmentLiveAlertsStub,
      };

      const courseRepository = {
        get: courseRepository_getStub,
      };

      const competenceRepository = {
        getCompetenceName: competenceRepository_getCompetenceNameStub,
      };

      const challengeToPlayRepository = {
        get: challengeToPlayRepository_getStub,
      };

      dependencies = {
        assessmentId,
        userId,
        locale,
        evaluationUsecases,
        assessmentRepository,
        certificationEvaluationRepository,
        courseRepository,
        competenceRepository,
        challengeToPlayRepository,
      };
    });

    context('when assessment is not started', function () {
      let assessment;

      beforeEach(function () {
        assessment = domainBuilder.buildAssessment({ id: assessmentId, type: Assessment.types.PREVIEW });
        assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
      });

      [
        Assessment.states.ABORTED,
        Assessment.states.COMPLETED,
        Assessment.states.ENDED_BY_INVIGILATOR,
        Assessment.states.ENDED_DUE_TO_FINALIZATION,
      ].forEach((assessmentState) => {
        it(`should return an assessment with its answers`, async function () {
          assessment.state = assessmentState;

          const { assessment: assessmentWithNextChallenge, globalProgression } =
            await updateAssessmentWithNextChallenge(dependencies);

          expect(assessmentWithNextChallenge).to.deepEqualInstance(assessment);
          expect(assessmentWithNextChallenge.nextChallenge).to.be.null;
          expect(globalProgression).to.be.null;
        });
      });
    });

    context('when assessment is started', function () {
      it('should return an Assessment', async function () {
        const assessment = domainBuilder.buildAssessment({
          state: Assessment.states.STARTED,
          type: Assessment.types.DEMO,
          courseId: 'recCourseId',
        });
        courseRepository_getStub
          .withArgs('recCourseId')
          .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course' }));
        assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        assessmentRepository_updateLastQuestionDateStub.resolves();
        assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('challengeForPreview');
        challengeToPlayRepository_getStub.withArgs('challengeForPreview').resolves(nextChallenge);

        const { assessment: assessmentWithNextChallenge, globalProgression } =
          await updateAssessmentWithNextChallenge(dependencies);

        expect(assessmentWithNextChallenge).to.deepEqualInstance(assessment);
        expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
        expect(globalProgression).to.be.null;
      });

      it('should compute next challenge', async function () {
        const assessment = domainBuilder.buildAssessment({
          state: Assessment.states.STARTED,
          type: Assessment.types.DEMO,
          answers: [domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' })],
          courseId: 'recCourseId',
        });
        courseRepository_getStub
          .withArgs('recCourseId')
          .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course' }));
        assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        assessmentRepository_updateLastQuestionDateStub.resolves();
        assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('challengeForPreview');
        challengeToPlayRepository_getStub.withArgs('challengeForPreview').resolves(nextChallenge);

        const { assessment: assessmentWithNextChallenge, globalProgression } =
          await updateAssessmentWithNextChallenge(dependencies);

        expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
        expect(globalProgression).to.be.null;
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
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        });

        it('returns null', async function () {
          const { assessment: assessmentWithoutChallenge, globalProgression } =
            await updateAssessmentWithNextChallenge(dependencies);

          expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
          expect(globalProgression).to.be.null;
        });
      });

      context('for assessment of type DEMO', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.DEMO,
            answers: [],
            courseId: 'recCourseId',
          });
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        });

        context('when course is not playable', function () {
          it('should throw a NotFoundError', async function () {
            courseRepository_getStub.withArgs('recCourseId').resolves(domainBuilder.buildCourse({ isActive: false }));
            const err = await catchErr(updateAssessmentWithNextChallenge)(dependencies);

            expect(err).to.deepEqualInstance(new NotFoundError("Le test demandé n'existe pas"));
          });
        });

        context('when there are still more challenges to evaluate', function () {
          it('should call usecase and return value from demo usecase', async function () {
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            assessmentRepository_updateLastQuestionDateStub.resolves();
            courseRepository_getStub
              .withArgs('recCourseId')
              .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course' }));
            evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('challengeForDemo');
            challengeToPlayRepository_getStub.withArgs('challengeForDemo').resolves(nextChallenge);
            const { assessment: assessmentWithNextChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);

            expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
            expect(assessmentWithNextChallenge.title).to.equal('Mon super course');
            expect(globalProgression).to.be.null;
          });
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            courseRepository_getStub
              .withArgs('recCourseId')
              .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course' }));
            evaluationUsecases_getNextChallengeForDemoStub.rejects(new AssessmentEndedError());

            // when
            const { assessment: assessmentWithoutChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
            expect(assessmentWithoutChallenge.title).to.equal('Mon super course');
            expect(globalProgression).to.be.null;
          });
        });
      });

      context('for assessment of type CAMPAIGN', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.CAMPAIGN,
            campaignParticipationId: 165465,
            answers: [],
          });
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        });

        it('should call usecase and return value from campaign usecase', async function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          evaluationUsecases_getNextChallengeForCampaignAssessmentStub
            .withArgs({ assessment, locale })
            .resolves('challengeForCampaign');
          challengeToPlayRepository_getStub.withArgs('challengeForCampaign').resolves(nextChallenge);
          const { assessment: assessmentWithNextChallenge, globalProgression } =
            await updateAssessmentWithNextChallenge(dependencies);

          expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
          expect(globalProgression).to.be.null;
        });

        it('throw an error when campaignParticipationId is missing', async function () {
          const deletedParticipationAssessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.CAMPAIGN,
            campaignParticipationId: null,
            answers: [],
          });
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(deletedParticipationAssessment);
          const error = await catchErr(updateAssessmentWithNextChallenge)(dependencies);

          expect(error).instanceOf(CampaignParticipationDeletedError);
          expect(evaluationUsecases_getProgressionStub.called).false;
          expect(evaluationUsecases_getNextChallengeForCampaignAssessmentStub.called).false;
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            evaluationUsecases_getNextChallengeForCampaignAssessmentStub.rejects(new AssessmentEndedError());

            // when
            const { assessment: assessmentWithoutChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
            expect(globalProgression).to.be.null;
          });
        });

        context('when campaign is of type Exam', function () {
          it('should call usecase and return value from campaign usecase and global progression', async function () {
            const examAssessment = domainBuilder.buildAssessment({
              id: 1234,
              state: Assessment.states.STARTED,
              type: Assessment.types.CAMPAIGN,
              campaignParticipationId: 165465,
              campaign: domainBuilder.buildCampaign({
                type: CampaignTypes.EXAM,
              }),
              answers: [],
            });
            assessmentRepository_getWithAnswersStub.withArgs(1234).resolves(examAssessment);
            assessmentRepository_updateLastQuestionDateStub.resolves();
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            const myGlobalProgression = Symbol('myGlobalProgression');
            evaluationUsecases_getProgressionStub
              .withArgs({
                progressionId: '1234',
                userId,
              })
              .resolves({
                completionRate: myGlobalProgression,
              });
            evaluationUsecases_getNextChallengeForCampaignAssessmentStub
              .withArgs({ assessment: examAssessment, locale })
              .resolves('challengeForCampaign');
            challengeToPlayRepository_getStub.withArgs('challengeForCampaign').resolves(nextChallenge);
            const { assessment: assessmentWithNextChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge({
                ...dependencies,
                assessmentId: 1234,
              });

            expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
            expect(globalProgression).to.equal(myGlobalProgression);
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
            competenceId: 'recCompetenceId',
          });
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
        });

        it('should call usecase and return value from competence evaluation usecase', async function () {
          competenceRepository_getCompetenceNameStub
            .withArgs({ id: assessment.competenceId, locale })
            .resolves('Ma super compétence');
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          evaluationUsecases_getNextChallengeForCompetenceEvaluationStub
            .withArgs({ assessment, userId, locale })
            .resolves('challengeForCompetenceEvaluation');
          challengeToPlayRepository_getStub.withArgs('challengeForCompetenceEvaluation').resolves(nextChallenge);
          const { assessment: assessmentWithNextChallenge, globalProgression } =
            await updateAssessmentWithNextChallenge(dependencies);

          expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
          expect(assessmentWithNextChallenge.title).to.equal('Ma super compétence');
          expect(globalProgression).to.be.null;
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            competenceRepository_getCompetenceNameStub
              .withArgs({ id: assessment.competenceId, locale })
              .resolves('Ma super compétence');
            evaluationUsecases_getNextChallengeForCompetenceEvaluationStub.rejects(new AssessmentEndedError());

            // when
            const { assessment: assessmentWithoutChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
            expect(assessmentWithoutChallenge.title).to.equal('Ma super compétence');
            expect(globalProgression).to.be.null;
          });
        });
      });

      context('for assessment of type CERTIFICATION', function () {
        let assessment, certificationChallengeLiveAlert, certificationCompanionLiveAlert;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: Assessment.types.CERTIFICATION,
            answers: [],
          });
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
          certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
            assessmentId: assessment.id,
          });
          certificationCompanionLiveAlert = domainBuilder.buildCertificationCompanionLiveAlert({
            assessmentId: assessment.id,
          });
          certificationEvaluationRepository_getAssessmentLiveAlertsStub
            .withArgs({ assessmentId: assessment.id })
            .resolves({
              challengeLiveAlerts: [certificationChallengeLiveAlert],
              companionLiveAlerts: [certificationCompanionLiveAlert],
            });
        });

        it('should call usecase and return value from certification usecase', async function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          certificationEvaluationRepository_selectNextCertificationChallengeStub
            .withArgs({ assessmentId: assessment.id })
            .resolves('challengeForCertification');
          challengeToPlayRepository_getStub.withArgs('challengeForCertification').resolves(nextChallenge);
          const { assessment: assessmentWithNextChallenge, globalProgression } =
            await updateAssessmentWithNextChallenge(dependencies);

          expect(assessmentWithNextChallenge.nextChallenge).to.equal(nextChallenge);
          expect(assessmentWithNextChallenge.challengeLiveAlerts).to.deep.equal([certificationChallengeLiveAlert]);
          expect(assessmentWithNextChallenge.companionLiveAlerts).to.deep.equal([certificationCompanionLiveAlert]);
          expect(globalProgression).to.be.null;
        });

        context('when there is no more challenge', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            certificationEvaluationRepository_selectNextCertificationChallengeStub.rejects(new AssessmentEndedError());

            // when
            const { assessment: assessmentWithoutChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);
            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
            expect(assessmentWithoutChallenge.challengeLiveAlerts).to.deep.equal([certificationChallengeLiveAlert]);
            expect(assessmentWithoutChallenge.companionLiveAlerts).to.deep.equal([certificationCompanionLiveAlert]);
            expect(globalProgression).to.be.null;
          });
        });

        context('when the referential is exhausted before reaching maximum assessment length', function () {
          it('should return an assessment with no nextChallenge', async function () {
            // given
            certificationEvaluationRepository_selectNextCertificationChallengeStub.rejects(
              new AssessmentLackOfChallengesError({ numberOfAnswers: 27, maximumAssessmentLength: 32 }),
            );

            // when
            const { assessment: assessmentWithoutChallenge, globalProgression } =
              await updateAssessmentWithNextChallenge(dependencies);

            // then
            expect(assessmentWithoutChallenge.nextChallenge).to.be.null;
            expect(assessmentWithoutChallenge.challengeLiveAlerts).to.deep.equal([certificationChallengeLiveAlert]);
            expect(assessmentWithoutChallenge.companionLiveAlerts).to.deep.equal([certificationCompanionLiveAlert]);
            expect(globalProgression).to.be.null;
          });
        });

        context('when an unexpected error occurs', function () {
          it('should propagate the error', async function () {
            // given
            const unexpectedError = new Error('Some unexpected error');
            certificationEvaluationRepository_selectNextCertificationChallengeStub.rejects(unexpectedError);

            // when
            const promise = updateAssessmentWithNextChallenge(dependencies);

            // then
            await expect(promise).to.be.rejectedWith(unexpectedError);
          });
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
            type: Assessment.types.DEMO,
            answers: [],
            courseId: 'recCourseId',
          });
          assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
          courseRepository_getStub
            .withArgs('recCourseId')
            .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course', id: 'recCourseId' }));
          evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('someChallengeId');
          challengeToPlayRepository_getStub.withArgs('someChallengeId').resolves(nextChallenge);
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
        });

        afterEach(async function () {
          clock.restore();
        });

        it(`should update the last question date`, async function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();

          await updateAssessmentWithNextChallenge(dependencies);

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
              type: Assessment.types.DEMO,
              courseId: 'recCourseId',
            });
            assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);
            courseRepository_getStub
              .withArgs('recCourseId')
              .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course', id: 'recCourseId' }));
            evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves(null);

            await updateAssessmentWithNextChallenge(dependencies);

            expect(assessmentRepository_updateWhenNewChallengeIsAskedStub).to.not.have.been.called;
          });
        });

        context('when next challenge found is the latest challenge asked for assessment', function () {
          it('should not update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.DEMO,
              lastChallengeId: 'currentChallengeId',
              answers: [domainBuilder.buildAnswer({ challengeId: 'currentChallengeId' })],
              courseId: 'recCourseId',
            });
            courseRepository_getStub
              .withArgs('recCourseId')
              .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course', id: 'recCourseId' }));
            assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);

            evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('currentChallengeId');
            challengeToPlayRepository_getStub.withArgs('currentChallengeId').resolves(nextChallenge);

            await updateAssessmentWithNextChallenge(dependencies);

            expect(assessmentRepository_updateWhenNewChallengeIsAskedStub).to.not.have.been.called;
          });
        });

        context('when next challenge found is different from the latest challenge asked for assessment', function () {
          it('should update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.DEMO,
              lastChallengeId: 'previousChallengeId',
              answers: [domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' })],
              courseId: 'recCourseId',
            });
            courseRepository_getStub
              .withArgs('recCourseId')
              .resolves(domainBuilder.buildCourse({ isActive: true, name: 'Mon super course', id: 'recCourseId' }));
            assessmentRepository_getWithAnswersStub.withArgs(assessmentId).resolves(assessment);

            evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves('nextChallengeId');
            challengeToPlayRepository_getStub.withArgs('nextChallengeId').resolves(nextChallenge);
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();

            await updateAssessmentWithNextChallenge(dependencies);

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
