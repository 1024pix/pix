import { expect } from 'chai';
import sinon from 'sinon';

import { updateCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/update-campaign.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | update-campaign', function () {
  let campaignAdministrationRepository, membershipRepository;

  beforeEach(function () {
    campaignAdministrationRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    membershipRepository = { findByUserIdAndOrganizationId: sinon.stub() };
  });

  context('when campaign exists', function () {
    it('should update the campaign', async function () {
      // given
      const organizationId = 1;
      const owner = domainBuilder.buildUser();
      const campaign = domainBuilder.prescription.campaign.buildCampaign.ofTypeAssessment({
        id: 1,
        name: 'Old name',
        title: 'Old title',
        type: 'ASSESSMENT',
        customLandingPageText: 'Old text',
        userId: owner.id,
        ownerId: owner.id,
        organizationId,
      });
      const expectedResult = Symbol('updatedCampaign');
      sinon.stub(campaign, 'updateFields');
      campaignAdministrationRepository.get.withArgs(campaign.id).resolves(campaign);
      campaignAdministrationRepository.update.withArgs(campaign).resolves(expectedResult);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: owner.id, organizationId: campaign.organizationId })
        .resolves([Symbol('membership')]);
      const attributesToUpdate = {
        title: 'New Title',
        name: 'New Name',
        customLandingPageText: 'New Custom Landing Page Text',
        ownerId: owner.id,
      };

      // when
      const resultCampaign = await updateCampaign({
        campaignId: campaign.id,
        ownerId: owner.id,
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
      const organizationId = 1;
      const ownerWithoutMembership = domainBuilder.buildUser();
      const campaign = domainBuilder.prescription.campaign.buildCampaign({ organizationId });

      campaignAdministrationRepository.get.withArgs(campaign.id).resolves(campaign);
      membershipRepository.findByUserIdAndOrganizationId
        .withArgs({ userId: ownerWithoutMembership.id, organizationId })
        .resolves([]);

      // when
      const error = await catchErr(updateCampaign)({
        campaignId: campaign.id,
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
