const { sinon, expect, factory } = require('../../../test-helper');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | allow-user-to-share-his-campaign-result', () => {

  let sandbox;
  let user;
  let userId;
  let assessment;
  let assessmentId;
  let expectedCampaignParticipation;
  const campaignParticipationRepository = {
    updateCampaignParticipation() {
    },
    findByAssessmentId() {
    },
  };
  const smartPlacementAssessmentRepository = {
    checkIfAssessmentBelongToUser() {
    },
  };

  beforeEach(() => {
    user = factory.buildUser();
    userId = user.id;
    assessment = factory.buildSmartPlacementAssessment({ userId: userId });
    assessmentId = assessment.id;

    sandbox = sinon.sandbox.create();
    sandbox.stub(smartPlacementAssessmentRepository, 'checkIfAssessmentBelongToUser');
    sandbox.stub(campaignParticipationRepository, 'findByAssessmentId').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when the share request comes from the owner of the assessment', () => {

    beforeEach(() => {
      smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(true);
    });
    
    context('when the assessmentId is in the database', () => {

      beforeEach(() => {
        expectedCampaignParticipation = factory.buildCampaignParticipation({
          assessmentId: assessmentId,
          isShared: true
        });
        sandbox.stub(campaignParticipationRepository, 'updateCampaignParticipation')
          .resolves(expectedCampaignParticipation);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should return a modified campaign participation', () => {
        // when
        const promise = usecases.allowUserToShareHisCampaignResult({
          userId,
          assessmentId,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
        });

        // then
        return promise.then((result) => {
          expect(result).to.deep.equal(expectedCampaignParticipation);
        });
      });
    });

    context('when the assessmentId is not in the database', () => {

      beforeEach(() => {
        sandbox.stub(campaignParticipationRepository, 'updateCampaignParticipation').rejects(new NotFoundError());
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should reject with a Not Found Error', () => {
        // when
        const promise = usecases.allowUserToShareHisCampaignResult({
          userId,
          assessmentId,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
        });

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });
    });
  });

  context('when the share request does not come from the owner of the assessment', () => {

    beforeEach(() => {
      smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(false);
    });

    it('should reject an UserNotAuthorizedToAccessEntity error', () => {
      // given
      const wrongUserId = userId + 1;

      // when
      const promise = usecases.allowUserToShareHisCampaignResult({
        userId: wrongUserId,
        assessmentId,
        campaignParticipationRepository,
        smartPlacementAssessmentRepository,
      });

      // then
      return expect(promise).to.have.been.rejectedWith(UserNotAuthorizedToAccessEntity);
    });

  });

});
