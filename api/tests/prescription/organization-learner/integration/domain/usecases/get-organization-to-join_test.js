import * as campaignRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { OrganizationToJoin } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationToJoin.js';
import { getOrganizationToJoin } from '../../../../../../src/prescription/organization-learner/domain/usecases/get-organization-to-join.js';
import { repositories } from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/index.js';
import * as combinedCourseRepository from '../../../../../../src/quest/infrastructure/repositories/combined-courses/combined-course-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | get-organization-to-join', function () {
  it('should return organizationToJoin given campaign code', async function () {
    //given
    const campaign = databaseBuilder.factory.buildCampaign({ organizationId: 1, code: 'ABC' });
    const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
    const organizationToJoin = new OrganizationToJoin({
      ...organization,
      identityProvider: null,
      code: campaign.code,
    });

    await databaseBuilder.commit();

    //when
    const result = await getOrganizationToJoin({
      code: campaign.code,
      organizationToJoinRepository: repositories.organizationToJoinRepository,
      campaignRepository,
      combinedCourseRepository,
    });

    //then
    expect(result).to.deep.equal(organizationToJoin);
  });
  it('should return organizationToJoin given combinedCourse code', async function () {
    //given
    const quest = databaseBuilder.factory.buildCombinedCourse({ organizationId: 1, code: 'ABC' });
    const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
    const organizationToJoin = new OrganizationToJoin({
      ...organization,
      identityProvider: null,
      code: quest.code,
    });

    await databaseBuilder.commit();

    //when
    const result = await getOrganizationToJoin({
      code: quest.code,
      organizationToJoinRepository: repositories.organizationToJoinRepository,
      campaignRepository,
      combinedCourseRepository,
    });

    //then
    expect(result).to.deep.equal(organizationToJoin);
  });
});
