import { expect, domainBuilder } from '../../../test-helper.js';
import { OrganizationLearnerActivity } from '../../../../lib/domain/read-models/OrganizationLearnerActivity.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';

describe('Unit | Domain | Read-Models | OrganizationLearnerActivity', function () {
  it('computes the activity statistics for every status of every campaign types', function () {
    const participations = [
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.STARTED,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.TO_SHARE,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.SHARED,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.PROFILES_COLLECTION,
        status: CampaignParticipationStatuses.TO_SHARE,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.PROFILES_COLLECTION,
        status: CampaignParticipationStatuses.SHARED,
      }),
    ];

    const expectedStatistics = [
      {
        campaignType: CampaignTypes.ASSESSMENT,
        started: 1,
        to_share: 1,
        shared: 1,
        total: 3,
      },
      {
        campaignType: CampaignTypes.PROFILES_COLLECTION,
        to_share: 1,
        shared: 1,
        total: 2,
      },
    ];

    const activity = new OrganizationLearnerActivity({ id: '123', participations });

    expect(activity.statistics).to.deep.equal(expectedStatistics);
  });
  it('computes the activity statistics with multiple participations in a specific campaign type and status', function () {
    const participations = [
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.STARTED,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.STARTED,
      }),
      domainBuilder.buildOrganizationLearnerParticipation({
        campaignType: CampaignTypes.ASSESSMENT,
        status: CampaignParticipationStatuses.STARTED,
      }),
    ];

    const expectedStatistics = [
      {
        campaignType: CampaignTypes.ASSESSMENT,
        started: 3,
        to_share: 0,
        shared: 0,
        total: 3,
      },
      {
        campaignType: CampaignTypes.PROFILES_COLLECTION,
        to_share: 0,
        shared: 0,
        total: 0,
      },
    ];

    const activity = new OrganizationLearnerActivity({ id: '123', participations });

    expect(activity.statistics).to.deep.equal(expectedStatistics);
  });
});
