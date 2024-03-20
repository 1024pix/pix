import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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
      originalCampaign = domainBuilder.prescription.campaign.buildCampaign({
        id: 1,
        name: 'Old name',
        title: 'Old title',
        type: 'ASSESSMENT',
        customLandingPageText: 'Old text',
        creatorId,
        ownerId,
        organizationId,
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
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: ownerId, organizationId })
        .resolves([ownerwithMembership]);
    });

    it('should update the campaign', async function () {
      // given
      const campaign = domainBuilder.prescription.campaign.buildCampaign.ofTypeAssessment({
        ...originalCampaign,
      });
      const expectedResult = Symbol('updatedCampaign');
      sinon.stub(campaign, 'updateFields');
      campaignAdministrationRepository.get.withArgs(campaign.id).resolves(campaign);
      campaignAdministrationRepository.update.withArgs(campaign).resolves(expectedResult);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: userWithMembership.id, organizationId: campaign.organizationId })
        .resolves([Symbol('membership')]);
      const attributesToUpdate = {
        title: 'New Title',
        name: 'New Name',
        customLandingPageText: 'New Custom Landing Page Text',
        ownerId: 1,
      };

      // when
      const resultCampaign = await usecases.updateCampaign({
        userId: userWithMembership.id,
        campaignId: campaign.id,
        ownerId,
        membershipRepository,
        campaignAdministrationRepository,
        ...attributesToUpdate,
      });

      // then
      expect(campaign.updateFields).to.have.been.calledWithMatch(attributesToUpdate);
      expect(resultCampaign).to.equal(expectedResult);
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
      originalCampaign = domainBuilder.prescription.campaign.buildCampaign({ organizationId });

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
      expect(campaignAdministrationRepository.update).to.not.have.been.called;
    });
  });
});
