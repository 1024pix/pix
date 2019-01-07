const { expect, sinon, domainBuilder } = require('../../../test-helper');
const moment = require('moment');
const getSkillReview = require('../../../../lib/domain/usecases/get-skill-review');

const SkillReview = require('../../../../lib/domain/models/SkillReview');

const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-skill-review', () => {

  const skillReviewId = 'skill-review-1234';
  const assessmentId = 1234;
  const userId = 9874;
  const smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment({
    id: assessmentId,
    userId
  });

  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { findByUserId: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(smartPlacementAssessmentRepository, 'get').resolves(smartPlacementAssessment);
    sandbox.stub(smartPlacementKnowledgeElementRepository, 'findByUserId').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getSkillReview', () => {

    context('when the assessment exists and belongs to user', () => {
      it('should load the right assessment', () => {
        // when
        const promise = getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return promise.then(() => {
          expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
        });
      });

      it('should add the correct knowledgeElements to the assessments', () => {
        // given
        const endOfCampaignParticipation = smartPlacementAssessment.campaignParticipation.sharedAt;
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:1, createdAt: moment(endOfCampaignParticipation).subtract(2, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'invalidated', id:2, createdAt: moment(endOfCampaignParticipation).subtract(4, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:3, createdAt: moment(endOfCampaignParticipation).add(2, 'days'), skillId: 2 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:4, createdAt: moment(endOfCampaignParticipation).subtract(2, 'days'), skillId: 3 })
        ];
        smartPlacementKnowledgeElementRepository.findByUserId.resolves(knowledgeElements);

        // when
        const promise = getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return promise.then((skillReview) => {
          expect(skillReview.validatedSkills).to.have.lengthOf(2);
          expect(skillReview.failedSkills).to.have.lengthOf(0);
        });
      });

      it('should add knowledgeElements with no limit on date', () => {
        // given
        smartPlacementAssessment.campaignParticipation.sharedAt = null;

        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:1, createdAt: moment().subtract(2, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'invalidated', id:2, createdAt: moment().subtract(4, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:3, createdAt: moment().add(2, 'days'), skillId: 2 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:4, createdAt: moment().subtract(2, 'days'), skillId: 3 })
        ];
        smartPlacementKnowledgeElementRepository.findByUserId.resolves(knowledgeElements);

        // when
        const promise = getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return promise.then((skillReview) => {
          expect(skillReview.validatedSkills).to.have.lengthOf(3);
          expect(skillReview.failedSkills).to.have.lengthOf(0);
        });
      });

      it('should return the skillReview associated to the assessment', () => {
        // when
        const promise = getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
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
        const promise = getSkillReview({
          userId,
          skillReviewId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
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
        const promise = getSkillReview({
          smartPlacementAssessmentRepository,
          skillReviewId,
          userId: unauthorizedUserId,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
