import sinon from 'sinon';

import { getOrganizationParticipantsStatistics } from '../../../../../../../src/prescription/campaign/domain/usecases/statistics/get-organization-participants-statistics.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | UseCase | getOrganizationParticipantsStatistics', function () {
  it('returns the total participants count for the given organization', async function () {
    // given
    const organizationId = 1;
    const campaignParticipationsStatsRepository = { countParticipantsByOrganizationId: sinon.stub() };
    campaignParticipationsStatsRepository.countParticipantsByOrganizationId.withArgs(organizationId).resolves(42);

    // when
    const result = await getOrganizationParticipantsStatistics({
      organizationId,
      campaignParticipationsStatsRepository,
    });

    // then
    expect(result).to.deep.equal({ totalParticipantsCount: 42 });
  });

  it('returns 0 when the organization has no participants', async function () {
    // given
    const organizationId = 1;
    const campaignParticipationsStatsRepository = { countParticipantsByOrganizationId: sinon.stub() };
    campaignParticipationsStatsRepository.countParticipantsByOrganizationId.withArgs(organizationId).resolves(0);

    // when
    const result = await getOrganizationParticipantsStatistics({
      organizationId,
      campaignParticipationsStatsRepository,
    });

    // then
    expect(result).to.deep.equal({ totalParticipantsCount: 0 });
  });
});
