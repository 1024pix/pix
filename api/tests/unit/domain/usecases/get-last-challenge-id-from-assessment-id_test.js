import { catchErr, expect, sinon, domainBuilder } from '../../../test-helper';
import getLastChallengeIdFromAssessmentId from '../../../../lib/domain/usecases/get-last-challenge-id-from-assessment-id';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | get-last-challenge-id-from-assessment-id', function () {
  let assessment;
  const assessmentLastChallengeId = 'last-challenge-id';

  beforeEach(async function () {
    assessment = await domainBuilder.buildAssessment({
      lastChallengeId: assessmentLastChallengeId,
    });

    sinon.stub(assessmentRepository, 'get');
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
