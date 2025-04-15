import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';
import { Statuses } from '../../../../../src/shared/domain/models/Challenge.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { getNextChallenge } from '../../../../../src/shared/domain/usecases/get-next-challenge.js';
import { catchErr, domainBuilder, expect, preventStubsToBeCalledUnexpectedly, sinon } from '../../../../test-helper.js';

describe('Shared | Unit | Domain | Use Cases | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let userId, assessmentId, locale, dependencies;
    let assessmentRepository_getStub;
    let assessmentRepository_updateLastQuestionDateStub;
    let assessmentRepository_updateWhenNewChallengeIsAskedStub;
    let answerRepository_findByAssessmentStub;
    let challengeRepository_getStub;
    let evaluationUsecases_getNextChallengeForPreviewStub;
    let evaluationUsecases_getNextChallengeForDemoStub;
    let evaluationUsecases_getNextChallengeForCampaignAssessmentStub;
    let evaluationUsecases_getNextChallengeForCompetenceEvaluationStub;
    let certificationEvaluationRepository_selectNextCertificationChallengeStub;

    beforeEach(function () {
      userId = 'someUserId';
      assessmentId = 'someAssessmentId';
      locale = 'someLocale';
      assessmentRepository_getStub = sinon.stub().named('get');
      assessmentRepository_updateLastQuestionDateStub = sinon.stub().named('updateLastQuestionDate');
      assessmentRepository_updateWhenNewChallengeIsAskedStub = sinon.stub().named('updateWhenNewChallengeIsAsked');
      answerRepository_findByAssessmentStub = sinon.stub().named('findByAssessment');
      challengeRepository_getStub = sinon.stub().named('get');
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
        assessmentRepository_getStub,
        assessmentRepository_updateLastQuestionDateStub,
        assessmentRepository_updateWhenNewChallengeIsAskedStub,
        answerRepository_findByAssessmentStub,
        challengeRepository_getStub,
        evaluationUsecases_getNextChallengeForPreviewStub,
        evaluationUsecases_getNextChallengeForDemoStub,
        evaluationUsecases_getNextChallengeForCampaignAssessmentStub,
        evaluationUsecases_getNextChallengeForCompetenceEvaluationStub,
        certificationEvaluationRepository_selectNextCertificationChallengeStub,
      ]);

      const assessmentRepository = {
        get: assessmentRepository_getStub,
        updateLastQuestionDate: assessmentRepository_updateLastQuestionDateStub,
        updateWhenNewChallengeIsAsked: assessmentRepository_updateWhenNewChallengeIsAskedStub,
      };

      const answerRepository = {
        findByAssessment: answerRepository_findByAssessmentStub,
      };

      const challengeRepository = {
        get: challengeRepository_getStub,
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
        assessmentId,
        userId,
        locale,
        assessmentRepository,
        answerRepository,
        challengeRepository,
        evaluationUsecases,
        certificationEvaluationRepository,
      };
    });

    context('when assessment is not started', function () {
      let assessment;

      beforeEach(function () {
        assessment = domainBuilder.buildAssessment({ id: assessmentId, type: Assessment.types.PREVIEW });
      });

      /* eslint-disable mocha/no-setup-in-describe */
      [
        Assessment.states.ABORTED,
        Assessment.states.COMPLETED,
        Assessment.states.ENDED_BY_SUPERVISOR,
        Assessment.states.ENDED_DUE_TO_FINALIZATION,
      ].forEach((assessmentState) => {
        it(`should throw a AssessmentEndedError when assessment is ${assessmentState}`, async function () {
          assessment.state = assessmentState;
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);

          const err = await catchErr(getNextChallenge)(dependencies);

          expect(err).to.be.instanceOf(AssessmentEndedError);
        });
      });
      /* eslint-enable mocha/no-setup-in-describe */
    });

    context('latest challenge asked', function () {
      context('when there are no challenge saved as latest challenge asked in assessment', function () {
        it('should compute next challenge', async function () {
          const assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.PREVIEW,
            lastChallengeId: null,
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForPreview' });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);
          answerRepository_findByAssessmentStub.withArgs(assessment.id).resolves([domainBuilder.buildAnswer()]);

          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('when the latest challenge asked has been answered', function () {
        it('should compute next challenge', async function () {
          const assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.PREVIEW,
            lastChallengeId: 'previousChallengeId',
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForPreview' });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);
          answerRepository_findByAssessmentStub
            .withArgs(assessment.id)
            .resolves([domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' })]);

          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
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
            assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
            assessmentRepository_updateLastQuestionDateStub.resolves();
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            const previousChallenge = domainBuilder.buildChallenge({
              id: 'previousChallengeId',
              status: Statuses.VALIDATED,
            });
            answerRepository_findByAssessmentStub
              .withArgs(assessment.id)
              .resolves([
                domainBuilder.buildAnswer({ challengeId: 'someChallengeId' }),
                domainBuilder.buildAnswer({ challengeId: 'someOtherChallengeId' }),
              ]);
            challengeRepository_getStub.withArgs('previousChallengeId').resolves(previousChallenge);

            const actualNextChallenge = await getNextChallenge(dependencies);

            expect(actualNextChallenge).to.deepEqualInstance(previousChallenge);
          });
        });
        context('when challenge is not operative', function () {
          it('should compute next challenge', async function () {
            const assessment = domainBuilder.buildAssessment({
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
              lastChallengeId: 'previousChallengeId',
            });
            assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
            assessmentRepository_updateLastQuestionDateStub.resolves();
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
            const challenge = domainBuilder.buildChallenge({ id: 'nextChallengeForPreview' });
            const previousChallenge = domainBuilder.buildChallenge({
              id: 'previousChallengeId',
              status: Statuses.OBSOLETE,
            });
            evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);
            answerRepository_findByAssessmentStub.withArgs(assessment.id).resolves([]);
            challengeRepository_getStub.withArgs('previousChallengeId').resolves(previousChallenge);

            const actualNextChallenge = await getNextChallenge(dependencies);

            expect(actualNextChallenge).to.deepEqualInstance(challenge);
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
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should call usecase and return value from preview usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForPreview' });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(challenge);
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('for assessment of type DEMO', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.DEMO,
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should call usecase and return value from demo usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForDemo' });
          evaluationUsecases_getNextChallengeForDemoStub.withArgs({ assessment }).resolves(challenge);
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('for assessment of type CAMPAIGN', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.CAMPAIGN,
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should call usecase and return value from campaign usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCampaign' });
          evaluationUsecases_getNextChallengeForCampaignAssessmentStub
            .withArgs({ assessment, locale })
            .resolves(challenge);
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('for assessment of type COMPETENCE_EVALUATION', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            type: Assessment.types.COMPETENCE_EVALUATION,
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should call usecase and return value from competence evaluation usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCompetenceEvaluation' });
          evaluationUsecases_getNextChallengeForCompetenceEvaluationStub
            .withArgs({ assessment, userId, locale })
            .resolves(challenge);
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('for assessment of type CERTIFICATION', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: Assessment.types.CERTIFICATION,
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should call usecase and return value from certification usecase', async function () {
          const challenge = domainBuilder.buildChallenge({ id: 'challengeForCertification' });
          certificationEvaluationRepository_selectNextCertificationChallengeStub
            .withArgs({ assessmentId: assessment.id, locale })
            .resolves(challenge);
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.deepEqualInstance(challenge);
        });
      });

      context('for assessment of type unknown', function () {
        let assessment;

        beforeEach(function () {
          assessment = domainBuilder.buildAssessment({
            state: Assessment.states.STARTED,
            id: assessmentId,
            type: 'coucou les zamis',
          });
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        it('should return null', async function () {
          const actualNextChallenge = await getNextChallenge(dependencies);

          expect(actualNextChallenge).to.be.null;
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
          });
          evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves({ id: 'someChallengeId' });
          assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        afterEach(async function () {
          clock.restore();
        });

        it(`should update the last question date`, async function () {
          assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
          assessmentRepository_updateLastQuestionDateStub.resolves();

          await getNextChallenge(dependencies);

          expect(assessmentRepository_updateLastQuestionDateStub).to.have.been.calledWithExactly({
            id: assessmentId,
            lastQuestionDate: new Date('2023-10-05'),
          });
        });
      });
      context('updating last challenge asked', function () {
        beforeEach(function () {
          assessmentRepository_updateLastQuestionDateStub.resolves();
          answerRepository_findByAssessmentStub.resolves([]);
        });

        context('when no next challenge has been found', function () {
          it('should not update last challenge asked', async function () {
            const assessment = domainBuilder.buildAssessment({
              id: assessmentId,
              state: Assessment.states.STARTED,
              type: Assessment.types.PREVIEW,
            });
            assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
            evaluationUsecases_getNextChallengeForPreviewStub.withArgs({}).resolves(null);

            await getNextChallenge(dependencies);

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
            });
            answerRepository_findByAssessmentStub.resolves([
              domainBuilder.buildAnswer({ challengeId: 'currentChallengeId' }),
            ]);
            assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
            evaluationUsecases_getNextChallengeForPreviewStub
              .withArgs({})
              .resolves(domainBuilder.buildChallenge({ id: 'currentChallengeId' }));

            await getNextChallenge(dependencies);

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
            });
            answerRepository_findByAssessmentStub.resolves([
              domainBuilder.buildAnswer({ challengeId: 'previousChallengeId' }),
            ]);
            assessmentRepository_getStub.withArgs(assessmentId).resolves(assessment);
            evaluationUsecases_getNextChallengeForPreviewStub
              .withArgs({})
              .resolves(domainBuilder.buildChallenge({ id: 'nextChallengeId' }));
            assessmentRepository_updateWhenNewChallengeIsAskedStub.resolves();

            await getNextChallenge(dependencies);

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
