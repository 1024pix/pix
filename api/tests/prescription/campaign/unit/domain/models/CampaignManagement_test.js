import { CampaignManagement } from '../../../../../../src/prescription/campaign/domain/models/CampaignManagement.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../../test-helper.js';

describe('CampaignManagement', function () {
  it('returns correct object', function () {
    const input = {
      id: 1,
      code: 'code',
      name: 'name',
      type: CampaignTypes.PROFILES_COLLECTION,
      idPixLabel: 'idPixLabel',
      idPixType: 'idPixType',
      createdAt: new Date(2020, 10, 23),
      archivedAt: new Date(2021, 10, 23),
      deletedAt: null,
      creatorLastName: 'creatorLastName',
      creatorFirstName: 'creatorFirstName',
      creatorId: 123,
      organizationId: 456,
      organizationName: 'organizationName',
      targetProfileId: 678,
      targetProfileName: 'targetProfileName',
      isForAbsoluteNovice: false,
      title: 'title',
      customLandingPageText: 'customLandingPageText',
      customResultPageText: 'customResultPageText',
      customResultPageButtonText: 'customResultPageButtonText',
      customResultPageButtonUrl: 'customResultPageButtonUrl',
      ownerLastName: 'ownerLastName',
      ownerFirstName: 'ownerFirstName',
      ownerId: 234,
      multipleSendings: 'multipleSendings',
      shared: 5,
      started: 3,
      completed: 2,
    };
    const campaignManagement = new CampaignManagement(input);

    expect(campaignManagement).to.deep.equal({
      id: 1,
      code: 'code',
      name: 'name',
      type: CampaignTypes.PROFILES_COLLECTION,
      idPixLabel: 'idPixLabel',
      idPixType: 'idPixType',
      createdAt: new Date(2020, 10, 23),
      archivedAt: new Date(2021, 10, 23),
      deletedAt: null,
      creatorLastName: 'creatorLastName',
      creatorFirstName: 'creatorFirstName',
      creatorId: 123,
      organizationId: 456,
      organizationName: 'organizationName',
      targetProfileId: 678,
      targetProfileName: 'targetProfileName',
      isForAbsoluteNovice: false,
      title: 'title',
      customLandingPageText: 'customLandingPageText',
      customResultPageText: 'customResultPageText',
      customResultPageButtonText: 'customResultPageButtonText',
      customResultPageButtonUrl: 'customResultPageButtonUrl',
      ownerLastName: 'ownerLastName',
      ownerFirstName: 'ownerFirstName',
      ownerId: 234,
      multipleSendings: 'multipleSendings',
      sharedParticipationsCount: 5,
      totalParticipationsCount: 10,
    });
  });

  describe('#totalParticipationsCount', function () {
    it('returns total participations count', function () {
      const campaignManagement = new CampaignManagement({
        id: 1,
        name: 'Assessment101',
        shared: 5,
        started: 3,
        completed: 2,
      });

      expect(campaignManagement.totalParticipationsCount).to.equal(10);
    });

    it('returns total participations count when started is undifined', function () {
      const campaignManagement = new CampaignManagement({
        id: 1,
        name: 'Assessment101',
        shared: 5,
        started: undefined,
        completed: 2,
      });

      expect(campaignManagement.totalParticipationsCount).to.equal(7);
    });
  });
});
