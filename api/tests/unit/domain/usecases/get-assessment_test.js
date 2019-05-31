const { expect, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-assessment', () => {

  let assessment;
  let assessmentResult;

  beforeEach(() => {
    assessmentResult = domainBuilder.buildAssessmentResult();
    assessment = domainBuilder.buildAssessment({
      assessmentResults:[assessmentResult]
    });

  });

  it('should resolve the Assessment domain object matching the given assessment ID', async () => {

    // when
    const result = await getAssessment({ assessment });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
  });

  it('should reject a domain NotFoundError when there is no assessment for given ID', () => {
    // when
    const promise = getAssessment({ assessment: null });

    // then
    return expect(promise).to.have.been.rejectedWith(NotFoundError, 'Assessment not found');
  });
});
