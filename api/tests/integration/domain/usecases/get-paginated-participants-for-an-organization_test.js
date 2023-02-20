import { expect, databaseBuilder } from '../../../test-helper';
import organizationParticipantRepository from '../../../../lib/infrastructure/repositories/organization-participant-repository';
import getPaginatedParticipantsForAnOrganization from '../../../../lib/domain/usecases/get-paginated-participants-for-an-organization';

describe('Integration | UseCases | get-paginated-participants-for-an-organization', function () {
  it('should get all participations for an organization', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Ah',
      organizationId,
    }).id;
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
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
