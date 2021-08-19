const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const updateCampaign = require('../../../../lib/domain/usecases/update-campaign');
const { UserNotAuthorizedToUpdateResourceError } = require('../../../../lib/domain/errors');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-campaign', function() {
  let originalCampaign;
  let userWithMembership;
  let campaignRepository;
  let userRepository;

  const organizationId = 1;
  const creatorId = 1;

  beforeEach(function() {

    originalCampaign = domainBuilder.buildCampaign({
      id: 1,
      name: 'Old name',
      title: 'Old title',
      type: 'ASSESSMENT',
      customLandingPageText: 'Old text',
      targetProfile: { id: 1 },
      creator: { id: creatorId },
      organization: { id: organizationId },
    });
    userWithMembership = {
      id: 1,
      memberships: [{ organization: { id: organizationId } }],
      hasAccessToOrganization: sinon.stub(),
    };
    userRepository = { getWithMemberships: sinon.stub() };
    campaignRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
    campaignRepository.update.callsFake((updatedCampaign) => updatedCampaign);
    userRepository.getWithMemberships.withArgs(userWithMembership.id).resolves(userWithMembership);
    userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
  });

  context('when campaign exists', function() {
    it('should update the campaign title only', function() {
      // given
      const updatedCampaign = domainBuilder.buildCampaign.ofTypeAssessment({
        ...originalCampaign,
        title: 'New title',
      });

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

    it('should update the campaign page text only', function() {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        customLandingPageText: 'New text',
      });

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

    it('should update the campaign archive date only', function() {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

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

    it('should update the campaign name only', function() {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        name: 'New Name',
      });

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

    it('should not update the campaign name if campaign name is undefined', function() {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

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

  context('when an error occurred', function() {
    it('should throw an error when the campaign could not be retrieved', function() {
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

    it('should throw an error when the user with memberships could not be retrieved', function() {
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

    it('should throw an error when the user does not have an access to the campaign organization', function() {
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

    it('should throw an error when the campaign could not be updated', function() {
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

    it('should throw an error when the campaign is not valid', async function() {
      originalCampaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({
        id: 1,
        name: 'I cannot have title',
        customLandingPageText: 'All our hopes now lie with one little test',
        organization: { id: organizationId },
        creator: { id: creatorId },
      });

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
