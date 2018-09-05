const { sinon, expect, factory } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | allow-user-to-share-his-campaign-result', () => {

  let sandbox;
  let expectedCampaignParticipation;
  const assessmentId = 4;
  const campaignParticipationRepository = {
    updateCampaignParticipation() {},
    findByAssessmentId() {},
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(campaignParticipationRepository, 'findByAssessmentId').resolves();
  });

  context('when the assessmentId is in the database', () => {

    beforeEach(() => {
      expectedCampaignParticipation = factory.buildCampaignParticipation({ assessmentId: assessmentId, isShared: true });
      sandbox.stub(campaignParticipationRepository, 'updateCampaignParticipation')
        .resolves(expectedCampaignParticipation);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a modified campaign participation', () => {
      // when
      const promise = usecases.allowUserToShareHisCampaignResult({
        assessmentId,
        campaignParticipationRepository,
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
        assessmentId,
        campaignParticipationRepository,
      });

      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });
});
