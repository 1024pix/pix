import { expect, databaseBuilder } from '../../../../test-helper.js';
import * as organizationParticipantRepository from '../../../../../src/prescription/learner-list/infrastructure/repositories/organization-participant-repository.js';
import { getPaginatedParticipantsForAnOrganization } from '../../../../../src/prescription/learner-list/domain/usescases/get-paginated-participants-for-an-organization.js';

describe('Integration | UseCases | get-paginated-participants-for-an-organization', function () {
  it('should get all participations for an organization', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Ah',
      organizationId,
    });
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      userId,
      campaignId,
    });

    await databaseBuilder.commit();

    // when
    const results = await getPaginatedParticipantsForAnOrganization({
      organizationId,
      filters: { fullName: 'Ah' },
      page: { number: 1, size: 10 },
      sort: { participationCount: 'asc' },
      organizationParticipantRepository,
    });

    // then
    const ids = results.organizationParticipants.map(({ id }) => id);
    expect(ids).to.deep.equals([organizationLearnerId]);
  });
});
