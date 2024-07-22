import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { CampaignsDestructor } from '../../../../../../src/prescription/campaign/domain/models/CampaignsDestructor.js';
import { OrganizationMembership } from '../../../../../../src/prescription/campaign/domain/read-models/OrganizationMembership.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipation.js';
import { ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('CampaignsDestructor', function () {
  describe('when datas are invalid', function () {
    it('throws an error when some campaigns does not belong to organization', function () {
      try {
        new CampaignsDestructor({
          organizationId: 1,
          campaignsToDelete: [new Campaign({ organizationId: 2 })],
        });
      } catch (error) {
        expect(error).to.be.instanceOf(ObjectValidationError);
        expect(error.message).to.equal('Some campaigns does not belong to organization.');
      }
    });

    it('throws an error when user is not owner', function () {
      try {
        new CampaignsDestructor({
          membership: new OrganizationMembership({ isAdmin: false }),
          userId: 1,
          campaignsToDelete: [new Campaign({ ownerId: 2 })],
        });
      } catch (error) {
        expect(error).to.be.instanceOf(ObjectValidationError);
        expect(error.message).to.equal('User does not have right to delete some campaigns.');
      }
    });
  });

  describe('#campaignParticipations', function () {
    it('returns campaign participations', function () {
      const participations = [new CampaignParticipation()];

      const destructor = new CampaignsDestructor({
        membership: new OrganizationMembership({ isAdmin: true }),
        campaignsToDelete: [],
        campaignParticipationsToDelete: participations,
      });

      expect(destructor.campaignParticipations).to.deep.equal(participations);
    });
  });

  describe('#campaigns', function () {
    it('returns campaigns', function () {
      const campaigns = [new Campaign()];

      const destructor = new CampaignsDestructor({
        membership: new OrganizationMembership({ isAdmin: true }),
        campaignsToDelete: campaigns,
      });

      expect(destructor.campaigns).to.deep.equal(campaigns);
    });
  });

  describe('#delete', function () {
    it('deletes campaigns and campaign participations', function () {
      const participations = [new CampaignParticipation()];
      const organizationId = 7;
      const campaigns = [new Campaign({ organizationId })];

      const destructor = new CampaignsDestructor({
        userId: 1,
        organizationId,
        membership: new OrganizationMembership({ isAdmin: true }),
        campaignsToDelete: campaigns,
        campaignParticipationsToDelete: participations,
      });

      destructor.delete();

      expect(destructor.campaigns[0].isDeleted).to.be.true;
      expect(destructor.campaignParticipations[0].isDeleted).to.be.true;
    });
  });
});
