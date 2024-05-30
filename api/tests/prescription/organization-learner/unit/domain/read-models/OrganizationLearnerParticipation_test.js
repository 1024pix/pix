import { OrganizationLearnerParticipation } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerParticipation.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../../test-helper.js';
const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Domain | Read-Models | OrganizationLearner | OrganizationLearnerParticipation', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about organizationLearner participation', function () {
      //given
      const organizationLearnerParticipation = new OrganizationLearnerParticipation({
        id: 202,
        campaignType: 'ASSESSMENT',
        campaignName: 'Hulk',
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
        status: SHARED,
        campaignId: 404,
        participationCount: 1,
        lastCampaignParticipationId: 202,
      });

      expect(organizationLearnerParticipation).to.deep.equal({
        id: 202,
        campaignType: 'ASSESSMENT',
        campaignName: 'Hulk',
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
        status: 'SHARED',
        campaignId: 404,
        participationCount: 1,
        lastCampaignParticipationId: 202,
      });
    });

    it('should use participation id if the lastSharedCampaignParticipationId is not provided', function () {
      const organizationLearnerParticipation = new OrganizationLearnerParticipation({
        id: 202,
        campaignType: 'ASSESSMENT',
        campaignName: 'Hulk',
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
        status: SHARED,
        campaignId: 404,
        participationCount: 1,
      });

      expect(organizationLearnerParticipation.lastCampaignParticipationId).to.deep.equal(
        organizationLearnerParticipation.id,
      );
    });
  });
});
