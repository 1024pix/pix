const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const updateCampaign = require('../../../../lib/domain/usecases/update-campaign');
const { UserNotAuthorizedToUpdateResourceError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-campaign', function () {
  let originalCampaign;
  let userWithMembership;
  let campaignRepository;
  let userRepository;

  const organizationId = 1;
  const creatorId = 1;

  beforeEach(function () {
    userRepository = { getWithMemberships: sinon.stub() };
    campaignRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('when campaign exists', function () {
    beforeEach(function () {
      originalCampaign = domainBuilder.buildCampaign({
        id: 1,
        name: 'Old name',
        title: 'Old title',
        type: 'ASSESSMENT',
        customLandingPageText: 'Old text',
        targetProfile: { id: 1 },
        creator: { id: creatorId },
        ownerId: domainBuilder.buildUser({ id: 10 }).id,
        organization: { id: organizationId },
      });
      userWithMembership = {
        id: 1,
        memberships: [{ organization: { id: organizationId } }],
        hasAccessToOrganization: sinon.stub(),
      };
      campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
      campaignRepository.update.callsFake((updatedCampaign) => updatedCampaign);
      userRepository.getWithMemberships.withArgs(userWithMembership.id).resolves(userWithMembership);
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
    });

    it('should update the campaign title only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign.ofTypeAssessment({
        ...originalCampaign,
        title: 'New title',
      });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        title: updatedCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.title).to.equal(updatedCampaign.title);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });

    it('should update the campaign page text only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        customLandingPageText: 'New text',
      });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        customLandingPageText: updatedCampaign.customLandingPageText,
        userRepository,
        campaignRepository,
      });

      // then
      expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.title).to.equal(originalCampaign.title);
      expect(resultCampaign.customLandingPageText).to.equal(updatedCampaign.customLandingPageText);
    });

    it('should update the campaign archive date only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.title).to.equal(originalCampaign.title);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });

    it('should update the campaign name only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        name: 'New Name',
      });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: updatedCampaign.name,
        title: originalCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.name).to.equal(updatedCampaign.name);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });

    it('should update the campaign ownerId only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        ownerId: domainBuilder.buildUser({ id: 50 }).id,
      });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: originalCampaign.name,
        title: originalCampaign.title,
        ownerId: updatedCampaign.ownerId,
        userRepository,
        campaignRepository,
      });

      // then
      expect(resultCampaign.ownerId).to.equal(updatedCampaign.ownerId);
    });

    it('should not update the campaign name if campaign name is undefined', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

      // when
      const resultCampaign = await updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: undefined,
        title: originalCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.name).to.equal(originalCampaign.name);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });
  });

  context('when an error occurred', function () {
    it('should throw an error when the user does not have an access to the campaign organization', async function () {
      // given
      const userWithoutMembership = {
        id: 1,
        hasAccessToOrganization: sinon.stub(),
      };
      originalCampaign = domainBuilder.buildCampaign({ organization: { id: organizationId } });

      campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
      userRepository.getWithMemberships.withArgs(userWithoutMembership.id).resolves(userWithoutMembership);
      userWithoutMembership.hasAccessToOrganization.withArgs(organizationId).returns(false);

      // when
      const error = await catchErr(updateCampaign)({
        userId: userWithoutMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateResourceError);
    });
  });
});
