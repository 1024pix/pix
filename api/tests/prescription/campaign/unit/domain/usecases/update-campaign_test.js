import { expect, sinon, catchErr, domainBuilder } from '../../../../../test-helper.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | update-campaign', function () {
  let originalCampaign;
  let userWithMembership;
  let ownerwithMembership;
  let campaignAdministrationRepository, membershipRepository;

  const organizationId = 1;
  const creatorId = 1;
  const ownerId = 2;

  beforeEach(function () {
    campaignAdministrationRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    membershipRepository = { findByUserIdAndOrganizationId: sinon.stub() };
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
        ownerId: domainBuilder.buildUser({ id: ownerId }).id,
        organization: { id: organizationId },
      });
      userWithMembership = {
        id: 1,
        memberships: [{ organization: { id: organizationId } }],
        hasAccessToOrganization: sinon.stub(),
      };
      ownerwithMembership = domainBuilder.buildMembership({
        user: domainBuilder.buildUser({ id: ownerId }),
        organization: { id: organizationId },
      });
      campaignAdministrationRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
      campaignAdministrationRepository.update.callsFake((updatedCampaign) => updatedCampaign);
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: ownerId, organizationId })
        .resolves([ownerwithMembership]);
    });

    it('should update the campaign title only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign.ofTypeAssessment({
        ...originalCampaign,
        title: 'New title',
      });

      // when
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        title: updatedCampaign.title,
        ownerId,
        membershipRepository,
        campaignAdministrationRepository,
      });

      // then
      expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(updatedCampaign);
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
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        ownerId,
        customLandingPageText: updatedCampaign.customLandingPageText,
        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.title).to.equal(originalCampaign.title);
      expect(resultCampaign.customLandingPageText).to.equal(updatedCampaign.customLandingPageText);
    });

    it('should update the campaign archive date only', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

      // when
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        ownerId,
        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(updatedCampaign);
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
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: updatedCampaign.name,
        title: originalCampaign.title,
        ownerId,
        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.name).to.equal(updatedCampaign.name);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });

    it('should update the campaign ownerId only', async function () {
      // given
      const newOwner = domainBuilder.buildUser({ id: 50 });
      const newOwnerWithMembership = domainBuilder.buildMembership({
        user: newOwner,
        organization: { id: organizationId },
      });
      const updatedCampaign = domainBuilder.buildCampaign({
        ...originalCampaign,
        ownerId: newOwner.id,
      });

      membershipRepository.findByUserIdAndOrganizationId.resolves([newOwnerWithMembership]);

      // when
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: originalCampaign.name,
        title: originalCampaign.title,
        ownerId: updatedCampaign.ownerId,

        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      expect(resultCampaign.ownerId).to.equal(updatedCampaign.ownerId);
    });

    it('should not update the campaign name if campaign name is undefined', async function () {
      // given
      const updatedCampaign = domainBuilder.buildCampaign({ ...originalCampaign });

      // when
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        name: undefined,
        title: originalCampaign.title,
        ownerId,
        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(updatedCampaign);
      expect(resultCampaign.name).to.equal(originalCampaign.name);
      expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
    });
  });

  context('when an error occurred', function () {
    it('should throw an error when the owner is not a member of organization', async function () {
      // given
      const ownerWithoutMembership = domainBuilder.buildUser();
      userWithMembership = {
        id: 1,
        memberships: [{ organization: { id: organizationId } }],
        hasAccessToOrganization: sinon.stub(),
      };
      originalCampaign = domainBuilder.buildCampaign({ organization: { id: organizationId } });

      campaignAdministrationRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: ownerWithoutMembership.id, organizationId })
        .resolves([]);

      // when
      const error = await catchErr(usecases.updateCampaign)({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        ownerId: ownerWithoutMembership.id,
        campaignAdministrationRepository,
        membershipRepository,
      });

      // then
      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([{ attribute: 'ownerId', message: 'OWNER_NOT_IN_ORGANIZATION' }]);
    });
  });
});
