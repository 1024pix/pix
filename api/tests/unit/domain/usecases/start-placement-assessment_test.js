const { expect, sinon, domainBuilder } = require('../../../test-helper');

const moment = require('moment');

const startPlacementAssessment = require('../../../../lib/domain/usecases/start-placement-assessment');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { AssessmentStartError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-placement-assessment', () => {

  let sandbox;
  let clock;
  let testCurrentDate;

  const assessmentRepository = {
    save: () => undefined,
    getLastPlacementAssessmentByUserIdAndCourseId: () => undefined,
  };

  beforeEach(() => {
    testCurrentDate = new Date('2018-01-10 05:00:00');
    clock = sinon.useFakeTimers(testCurrentDate.getTime());

    sandbox = sinon.createSandbox();
    sandbox.stub(assessmentRepository, 'save');
    sandbox.stub(assessmentRepository, 'getLastPlacementAssessmentByUserIdAndCourseId');
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
  });

  context('when there is no assessment completed and no assessment started concerning the user and course', () => {

    it('should start the assessment', async () => {
      // given
      const givenAssessment = domainBuilder.buildAssessment();
      const assessmentSpy = sinon.spy(givenAssessment, 'start');
      assessmentRepository.save.resolves();

      // when
      await startPlacementAssessment({ assessment: givenAssessment, assessmentRepository });

      // then
      return expect(assessmentSpy).to.have.been.calledOnce;
    });

    it('should return the started and saved assessment', async () => {
      // given
      const givenAssessment = domainBuilder.buildAssessment();
      const savedAssessment = domainBuilder.buildAssessment();
      assessmentRepository.save.withArgs(givenAssessment).resolves(savedAssessment);

      // when
      const assessment = await startPlacementAssessment({ assessment: givenAssessment, assessmentRepository });

      // then
      return expect(assessment).to.deep.equal(savedAssessment);
    });

  });

  context('when there is no assessment completed and one assessment started concerning the user and the course', () => {

    it('should throw an error with a message', () => {
      // given
      const courseId = 'rec43mpMIR5dUzdjh';
      const userId = '42';
      const placementAssessmentToStart = domainBuilder.buildAssessment({
        type: Assessment.types.PLACEMENT,
        state: null,
        userId,
        courseId,
      });

      const alreadyStartedPlacementAssessment = domainBuilder.buildAssessment({
        type: Assessment.types.PLACEMENT,
        state: Assessment.states.STARTED,
      });

      assessmentRepository.getLastPlacementAssessmentByUserIdAndCourseId
        .withArgs(userId, courseId)
        .resolves(alreadyStartedPlacementAssessment);

      // when
      const promise = startPlacementAssessment({ assessment: placementAssessmentToStart, assessmentRepository });

      // then
      return expect(promise).to.be.rejectedWith(AssessmentStartError, 'Impossible de démarrer un nouveau positionnement');
    });

  });

  context('when there is completed assessments and no started assessment concerning the user and the course', () => {

    context('and the user has to wait before being able start a new placement assessment on the course', () => {

      it('should throw an error with correct message', () => {
        // given
        const courseId = 'rec43mpMIR5dUzdjh';
        const userId = '42';
        const placementAssessmentToStart = domainBuilder.buildAssessment({
          type: Assessment.types.PLACEMENT,
          state: null,
          userId,
          courseId,
        });

        const assessmentResultCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
        const assessmentResult = domainBuilder.buildAssessmentResult({ createdAt: assessmentResultCreationDate });

        const completedAssessment = domainBuilder.buildAssessment({
          type: Assessment.types.PLACEMENT,
          state: Assessment.states.COMPLETED,
          assessmentResults: [assessmentResult],
        });

        assessmentRepository.getLastPlacementAssessmentByUserIdAndCourseId
          .withArgs(userId, courseId)
          .resolves(completedAssessment);

        // when
        const promise = startPlacementAssessment({ assessment: placementAssessmentToStart, assessmentRepository });

        // then
        return expect(promise).to.be.rejectedWith(AssessmentStartError, 'Impossible de démarrer un nouveau positionnement');
      });

    });

    context('and the user can start a new placement assessment on the course', () => {

      let placementAssessmentToStart;

      beforeEach(() => {
        const courseId = 'rec43mpMIR5dUzdjh';
        const userId = '42';
        placementAssessmentToStart = domainBuilder.buildAssessment({
          type: Assessment.types.PLACEMENT,
          state: null,
          userId,
          courseId,
        });

        const assessmentResultCreationDate = moment(testCurrentDate).subtract(8, 'day').toDate();
        const assessmentResult = domainBuilder.buildAssessmentResult({ createdAt: assessmentResultCreationDate });

        const completedAssessment = domainBuilder.buildAssessment({
          type: Assessment.types.PLACEMENT,
          state: Assessment.states.COMPLETED,
          assessmentResults: [assessmentResult],
        });

        assessmentRepository.getLastPlacementAssessmentByUserIdAndCourseId
          .withArgs(userId, courseId)
          .resolves(completedAssessment);
      });

      it('should start the assessment', async () => {
        // given
        const assessmentSpy = sinon.spy(placementAssessmentToStart, 'start');

        // when
        await startPlacementAssessment({ assessment: placementAssessmentToStart, assessmentRepository });

        // then
        return expect(assessmentSpy).to.have.been.calledOnce;

      });

      it('should return the started and saved assessment', async () => {
        // given
        const savedAssessment = domainBuilder.buildAssessment();
        assessmentRepository.save.withArgs(placementAssessmentToStart).resolves(savedAssessment);

        // when
        const assessment = await startPlacementAssessment({ assessment: placementAssessmentToStart, assessmentRepository });

        // then
        return expect(assessment).to.deep.equal(savedAssessment);
      });

    });

  });

});
