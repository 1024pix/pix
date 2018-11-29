const { expect, sinon, domainBuilder } = require('../../../test-helper');

const startPlacementAssessment = require('../../../../lib/domain/usecases/start-placement-assessment');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { AssessmentStartError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-placement-assessment', () => {

  let sandbox;
  const assessmentRepository = {
    save: () => undefined,
    getLastPlacementAssessmentByUserIdAndCourseId: () => undefined,
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'save');
    sandbox.stub(assessmentRepository, 'getLastPlacementAssessmentByUserIdAndCourseId');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when there is no assessment completed and no assessment started concerning the user and course', () => {

    it('should start the assessment', () => {
      // given
      const givenAssessment = domainBuilder.buildAssessment();
      const assessmentSpy = sinon.spy(givenAssessment, 'start');
      assessmentRepository.save.resolves();

      // when
      const promise = startPlacementAssessment({ assessment: givenAssessment, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentSpy).to.have.been.calledOnce;
      });
    });

    it('should return the started and saved assessment', () => {
      // given
      const givenAssessment = domainBuilder.buildAssessment();
      const savedAssessment = domainBuilder.buildAssessment();
      assessmentRepository.save.withArgs(givenAssessment).resolves(savedAssessment);

      // when
      const promise = startPlacementAssessment({ assessment: givenAssessment, assessmentRepository });

      // then
      return expect(promise).to.be.fulfilled.then((assessment) => expect(assessment).to.deep.equal(savedAssessment));
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
      return expect(promise).to.be.rejectedWith(AssessmentStartError, 'Une évaluation en cours existe déjà');
    });

  });

  context('when there is completed assessments and no started assessment concerning the user and the course', () => {

    context('and the user has to wait before being able to replay the course', () => {

      it('should throw an error with correct message', () => {
      });

    });

    context('and the user can replay the course', () => {

      it('should start the new assessment', () => {
      });

      it('should return the started and saved assessment', () => {
      });

    });

  });

});
