const { expect, sinon } = require('../../../test-helper');
const updateCampaign = require('../../../../lib/domain/usecases/update-campaign');

describe('Unit | UseCase | update-campaign', () => {

  let originalCampaign;
  let campaignRepository;

  beforeEach(() => {
    originalCampaign = {
      id: 1,
      title: 'Old title',
      customLandingPageText: 'Old text',
    };
    campaignRepository = {
      get: sinon.stub(),
      update: sinon.stub()
    };
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
    campaignRepository.update.callsFake((updatedCampaign) => updatedCampaign);
  });

  context('when campaign exists', () => {

    it('should update the campaign title', () => {
      // given
      const updatedCampaign = {
        id: originalCampaign.id,
        title: 'New title',
        customLandingPageText: originalCampaign.customLandingPageText,
      };

      // when
      const promise = updateCampaign({
        id: 1,
        title: updatedCampaign.title,
        campaignRepository
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(updatedCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
      });
    });

    it('should update the campaign page text', () => {
      // given
      const updatedCampaign = {
        id: originalCampaign.id,
        title: originalCampaign.title,
        customLandingPageText: 'New text',
      };

      // when
      const promise = updateCampaign({
        id: updatedCampaign.id,
        customLandingPageText: updatedCampaign.customLandingPageText,
        campaignRepository
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(originalCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(updatedCampaign.customLandingPageText);
      });
    });
  });

  context('when an error occurred', () => {

    it('should throw an error when the campaign could not be retrieved', () => {
      // given
      campaignRepository.get.withArgs(originalCampaign.id).rejects();

      // when
      const promise = updateCampaign({
        id: originalCampaign.id,
        campaignRepository
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the campaign could not be updated', () => {
      // given
      campaignRepository.update.withArgs(originalCampaign).rejects();

      // when
      const promise = updateCampaign({
        id: originalCampaign.id,
        campaignRepository
      });

      // then
      return expect(promise).to.be.rejected;
    });
  });

});
