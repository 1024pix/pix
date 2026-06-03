import { OrganizationNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | UseCases | get-organization-statistics', function () {
  it('should return statistics for a given organization id', async function () {
    // given
    const { organizationId, id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner();
    const { id: otherOrganizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      campaignId,
      createdAt: new Date('2020-01-01'),
    });
    databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId: otherOrganizationLearnerId,
      campaignId,
      createdAt: new Date('2020-01-02'),
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getOrganizationStatistics({ organizationId });

    // then
    expect(result).to.deep.equal({
      organizationId,
      totalParticipantsCount: 2,
      id: `${organizationId}_organization_statistics`,
      totalParticipantsCountByYear: [{ year: 2020, count: 2 }],
    });
  });

  it('should throw an OrganizationNotFoundError when organization does not exist', async function () {
    // when
    const error = await catchErr(usecases.getOrganizationStatistics)({ organizationId: 99 });

    // then
    expect(error).to.be.instanceOf(OrganizationNotFound);
    expect(error.meta).to.deep.equal({ organizationId: 99 });
  });
});
