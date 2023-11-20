import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as organizationParticipantRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-participant-repository.js';
import { findPaginatedFilteredParticipants } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-filtered-participants.js';

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
    const results = await findPaginatedFilteredParticipants({
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
