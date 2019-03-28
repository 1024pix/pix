const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
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

    sinon.stub(assessmentRepository, 'get');
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async () => {
    // given
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
  });

  it('should reject a domain NotFoundError when there is no assessment for given ID', () => {
    // given
    assessmentRepository.get.resolves(null);

    // when
    const promise = getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    return expect(promise).to.have.been.rejectedWith(NotFoundError, `Assessment not found for ID ${assessment.id}`);
  });
});
