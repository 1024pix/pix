import * as targetProfileApi from '../../../../../../src/prescription/target-profile/application/api/target-profile-api.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Acceptance | Application | target-profile-api', function () {
  it('should not fail', async function () {
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId });

    await databaseBuilder.commit();

    const result = await targetProfileApi.getByOrganizationId(organizationId);
    expect(result).to.be.ok;
  });
});
