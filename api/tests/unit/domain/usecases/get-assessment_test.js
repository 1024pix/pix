const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const scoringService = require('../../../../lib/domain/services/scoring-service');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-assessment', () => {

  let assessment;
  let assessmentScore;

  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    assessment = domainBuilder.buildAssessment();
    assessmentScore = domainBuilder.buildAssessmentScore();

    sandbox.stub(assessmentRepository, 'get');
    sandbox.stub(scoringService, 'calculateAssessmentScore');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async () => {
    // given
    assessmentRepository.get.resolves(assessment);
    scoringService.calculateAssessmentScore.resolves(assessmentScore);

    // when
    const result = await getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.estimatedLevel).to.equal(assessmentScore.level);
    expect(result.pixScore).to.equal(assessmentScore.nbPix);
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
