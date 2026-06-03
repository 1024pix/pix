import sinon from 'sinon';

import { getOrganizationParticipantsStatistics } from '../../../../../../../src/prescription/campaign/domain/usecases/statistics/get-organization-participants-statistics.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | UseCase | getOrganizationParticipantsStatistics', function () {
  it('returns an object with the total participants count and total participants count grouped by year, for the given organization', async function () {
    // given
    const organizationId = 1;
    const campaignParticipationsStatsRepository = {
      countParticipantsByOrganizationId: sinon.stub(),
      countParticipantsByOrganizationIdGroupedByYear: sinon.stub(),
    };
    campaignParticipationsStatsRepository.countParticipantsByOrganizationId.withArgs(organizationId).resolves(42);

    const totalParticipantsCount = 42;
    const totalParticipantsCountByYear = [
      { year: 2024, count: 5 },
      { year: 2025, count: 8 },
    ];
    campaignParticipationsStatsRepository.countParticipantsByOrganizationIdGroupedByYear
      .withArgs(organizationId)
      .resolves(totalParticipantsCountByYear);

    // when
    const result = await getOrganizationParticipantsStatistics({
      organizationId,
      campaignParticipationsStatsRepository,
    });

    // then
    expect(result).to.deep.equal({
      totalParticipantsCount,
      totalParticipantsCountByYear,
    });
  });

  it('returns 0 when the organization has no participants', async function () {
    // given
    const organizationId = 1;
    const campaignParticipationsStatsRepository = {
      countParticipantsByOrganizationId: sinon.stub(),
      countParticipantsByOrganizationIdGroupedByYear: sinon.stub(),
    };
    campaignParticipationsStatsRepository.countParticipantsByOrganizationId.withArgs(organizationId).resolves(0);
    campaignParticipationsStatsRepository.countParticipantsByOrganizationIdGroupedByYear
      .withArgs(organizationId)
      .resolves([]);

    // when
    const result = await getOrganizationParticipantsStatistics({
      organizationId,
      campaignParticipationsStatsRepository,
    });

    // then
    expect(result).to.deep.equal({ totalParticipantsCount: 0, totalParticipantsCountByYear: [] });
  });
});
