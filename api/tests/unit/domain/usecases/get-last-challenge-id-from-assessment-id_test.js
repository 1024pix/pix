const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');

const getLastChallengeIdFromAssessmentId = require('../../../../lib/domain/usecases/get-last-challenge-id-from-assessment-id');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-last-challenge-id-from-assessment-id', function () {
  let assessment;
  let assessmentRepository;
  const assessmentLastChallengeId = 'last-challenge-id';

  beforeEach(async function () {
    assessment = await domainBuilder.buildAssessment({
      lastChallengeId: assessmentLastChallengeId,
    });

    assessmentRepository = { get: sinon.stub() };
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async function () {
    assessmentRepository.get.resolves(assessment);

    const { lastChallengeId } = await getLastChallengeIdFromAssessmentId({
      assessmentId: assessment.id,
      assessmentRepository,
    });

    expect(lastChallengeId).to.equal(lastChallengeId);
  });

  it('should reject a domain NotFoundError when there is no assessment for given ID', async function () {
    assessmentRepository.get.resolves(null);

    const error = await catchErr(getLastChallengeIdFromAssessmentId)({
      assessmentRepository,
      assessmentId: assessment.id,
    });

    expect(error).to.be.an.instanceOf(NotFoundError, `Assessment not found for ID ${assessment.id}`);
  });
});
