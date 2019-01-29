const { expect, sinon, domainBuilder } = require('../../../test-helper');
const moment = require('moment');
const getSmartPlacementProgression = require('../../../../lib/domain/usecases/get-smart-placement-progression');

const SmartPlacementProgression = require('../../../../lib/domain/models/SmartPlacementProgression');

const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-smart-placement-progression', () => {

  const smartPlacementProgressionId = 'smart-placement-progression-1234';
  const assessmentId = 1234;
  const userId = 9874;
  const smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment({
    id: assessmentId,
    userId
  });

  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { findUniqByUserId: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(smartPlacementAssessmentRepository, 'get').resolves(smartPlacementAssessment);
    sandbox.stub(smartPlacementKnowledgeElementRepository, 'findUniqByUserId').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getSmartPlacementProgression', () => {

    context('when the assessment exists and belongs to user', () => {
      it('should load the right assessment', () => {
        // when
        const promise = getSmartPlacementProgression({
          userId,
          smartPlacementProgressionId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return promise.then(() => {
          expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
        });
      });

      it('should add the correct knowledgeElements to the assessments', async () => {
        // given
        const endOfCampaignParticipation = smartPlacementAssessment.campaignParticipation.sharedAt;
        const expectedKnowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:1, createdAt: moment(endOfCampaignParticipation).subtract(2, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'invalidated', id:2, createdAt: moment(endOfCampaignParticipation).subtract(4, 'days'), skillId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:4, createdAt: moment(endOfCampaignParticipation).subtract(2, 'days'), skillId: 3 })
        ];
        const knowledgeElements = expectedKnowledgeElements.concat([
          domainBuilder.buildSmartPlacementKnowledgeElement({ status: 'validated', id:3, createdAt: moment(endOfCampaignParticipation).add(2, 'days'), skillId: 2 }),
        ]);

        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);

        // when
        const smartPlacementProgression = await getSmartPlacementProgression({
          userId,
          smartPlacementProgressionId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        expect(smartPlacementProgression.knowledgeElements).to.deep.equals(expectedKnowledgeElements);

      });

      it('should return the smartPlacementProgression associated to the assessment', () => {
        // when
        const promise = getSmartPlacementProgression({
          userId,
          smartPlacementProgressionId,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return promise.then((smartPlacementProgression) => {
          expect(smartPlacementProgression).to.be.an.instanceOf(SmartPlacementProgression);
        });
      });
    });

    context('when the assessment does not exist', () => {
      it('should transfer the errors', () => {
        // given
        smartPlacementAssessmentRepository.get.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const promise = getSmartPlacementProgression({
          userId,
          smartPlacementProgressionId,
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
        const promise = getSmartPlacementProgression({
          smartPlacementAssessmentRepository,
          smartPlacementProgressionId,
          userId: unauthorizedUserId,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
