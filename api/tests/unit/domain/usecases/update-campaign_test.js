const { expect, sinon, catchErr } = require('../../../test-helper');
const updateCampaign = require('../../../../lib/domain/usecases/update-campaign');
const { UserNotAuthorizedToUpdateResourceError } = require('../../../../lib/domain/errors');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-campaign', () => {
  let originalCampaign;
  let userWithMembership;
  let campaignRepository;
  let userRepository;

  const organizationId = 1;

  beforeEach(() => {

    originalCampaign = {
      id: 1,
      name: 'Old name',
      title: 'Old title',
      type: 'ASSESSMENT',
      customLandingPageText: 'Old text',
      targetProfileId: 1,
      creatorId: 1,
      organizationId,
    };
    userWithMembership = {
      id: 1,
      memberships: [{ organization: { id: organizationId } }],
      hasAccessToOrganization: sinon.stub(),
    };
    userRepository = { getWithMemberships: sinon.stub() };
    campaignRepository = {
      get: sinon.stub(),
      update: sinon.stub()
    };
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
    campaignRepository.update.callsFake((updatedCampaign) => updatedCampaign);
    userRepository.getWithMemberships.withArgs(userWithMembership.id).resolves(userWithMembership);
    userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
  });

  context('when campaign exists', () => {
    it('should update the campaign title only', () => {
      // given
      const updatedCampaign = {
        ...originalCampaign,
        title: 'New title',
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        title: updatedCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(updatedCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
      });
    });

    it('should update the campaign page text only', () => {
      // given
      const updatedCampaign = {
        ...originalCampaign,
        customLandingPageText: 'New text',
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        customLandingPageText: updatedCampaign.customLandingPageText,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(originalCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(updatedCampaign.customLandingPageText);
      });
    });

    it('should update the campaign archive date only', () => {
      // given
      const updatedCampaign = { ...originalCampaign };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(originalCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
      });
    });

    it('should update the campaign name only', () => {
      // given
      const updatedCampaign = {
        ...originalCampaign,
        name: 'New Name',
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: updatedCampaign.name,
        title: originalCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.name).to.equal(updatedCampaign.name);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
      });
    });

    it('should not update the campaign name if campaign name is undefine', () => {
      // given
      const updatedCampaign = { ...originalCampaign };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: undefined,
        title: originalCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.name).to.equal(originalCampaign.name);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
      });
    });
  });

  context('when an error occurred', () => {
    it('should throw an error when the campaign could not be retrieved', () => {
      // given
      campaignRepository.get.withArgs(originalCampaign.id).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user with memberships could not be retrieved', () => {
      // given
      userRepository.getWithMemberships.withArgs(userWithMembership.id).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user does not have an access to the campaign organization', () => {
      // given
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(false);

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToUpdateResourceError);
    });

    it('should throw an error when the campaign could not be updated', () => {
      // given
      campaignRepository.update.withArgs(originalCampaign).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the campaign is not valid', async () => {
      originalCampaign = {
        id: 1,
        name: 'I cannot have title',
        customLandingPageText: 'All our hopes now lie with one little test',
        type: 'PROFILES_COLLECTION',
        organizationId,
      };

      campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);

      // when
      const error = await catchErr(updateCampaign)({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        title: 'You shall not pass !',
        userRepository,
        campaignRepository,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });
});
