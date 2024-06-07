import { findCampaignParticipationsForUserManagement } from '../../../../../../src/prescription/campaign-participation/domain/usecases/find-campaign-participations-for-user-management.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | findCampaignParticipationsForUserManagement', function () {
  const userId = 1;
  let expectedParticipationsForUserManagement;

  beforeEach(function () {
    expectedParticipationsForUserManagement = [
      domainBuilder.buildParticipationForCampaignManagement(),
      domainBuilder.buildParticipationForCampaignManagement(),
      domainBuilder.buildParticipationForCampaignManagement(),
    ];
  });

  it('should fetch campaign participations matching campaign', async function () {
    const participationsForUserManagementRepository = {
      findByUserId: sinon.stub(),
    };
    participationsForUserManagementRepository.findByUserId
      .withArgs(userId)
      .resolves(expectedParticipationsForUserManagement);

    const foundParticipationsForUserManagement = await findCampaignParticipationsForUserManagement({
      userId,
      participationsForUserManagementRepository,
    });

    expect(foundParticipationsForUserManagement).to.deep.equal(expectedParticipationsForUserManagement);
  });
});
