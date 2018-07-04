const { expect, sinon, factory } = require('../../../test-helper');

const useCase = require('../../../../lib/domain/usecases/');

const SkillReview = require('../../../../lib/domain/models/SkillReview');

const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-skill-review', () => {

  const skillReviewId = 'skill-review-1234';
  const assessmentId = 1234;
  const userId = 9874;
  const smartPlacementAssessment = factory.buildSmartPlacementAssessment({
    id: assessmentId,
    userId
  });

  const smartPlacementAssessmentRepository = { get: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(smartPlacementAssessmentRepository, 'get').resolves(smartPlacementAssessment);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getSkillReview', () => {

    context('when the assessment exists and belongs to user', () => {
      it('should load the right assessment', () => {
        // when
        const promise = useCase.getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
        });

        // then
        return promise.then(() => {
          expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
        });
      });

      it('should return the skillReview associated to the assessment', () => {
        // when
        const promise = useCase.getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
        });

        // then
        return promise.then((skillReview) => {
          expect(skillReview).to.be.an.instanceOf(SkillReview)
            .and.to.deep.equal(smartPlacementAssessment.generateSkillReview());
        });
      });
    });

    context('when the assessment does not exist', () => {
      it('should transfer the errors', () => {
        // given
        smartPlacementAssessmentRepository.get.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const promise = useCase.getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

    context('when the assessment is found but not authorized for current used', () => {
      it('should transfer the errors', () => {
        // given
        const unauthorizedUserId = 66666666666666;

        // when
        const promise = useCase.getSkillReview({
          smartPlacementAssessmentRepository,
          skillReviewId,
          userId: unauthorizedUserId,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
