const { expect, sinon, domainBuilder } = require('../../../test-helper');

const startPlacementAssessment = require('../../../../lib/domain/usecases/start-placement-assessment');

describe('Unit | UseCase | start-placement-assessment', () => {

  let sandbox;
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'save');
  });

  afterEach(() => {
    sandbox.restore();
  });

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

  it('should return the saved assessment', () => {
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
