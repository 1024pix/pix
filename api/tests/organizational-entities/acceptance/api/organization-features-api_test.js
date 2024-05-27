import * as organizationFeatureApi from '../../../../src/organizational-entities/application/api/organization-features-api.js';
import { databaseBuilder, expect } from '../../../test-helper.js';

describe('Acceptance | Organizational Entities | Application | organization-features-api', function () {
  it('should not fail', async function () {
    //given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const featureId = databaseBuilder.factory.buildFeature({ key: 'my_feature' }).id;

    databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });

    await databaseBuilder.commit();

    // when
    const result = await organizationFeatureApi.getAllFeaturesFromOrganization(organizationId);

    // then
    expect(result).to.be.ok;
  });
});
