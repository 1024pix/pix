import { enableComputeCertificabilityOnScoAefeOrganizations } from '../../../../scripts/prod/enable-compute-certificability-on-sco-aefe-organizations.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Scripts | enable-compute-certificability-on-sco-organizations-that-manages-students_test.js', function () {
  it('should enable COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY feature on organizations of type SCO with tag AEFE to true', async function () {
    // given
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
    const tagId = databaseBuilder.factory.buildTag({
      name: 'AEFE',
    }).id;

    const organizationId = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: false,
    }).id;

    databaseBuilder.factory.buildOrganizationTag({
      organizationId,
      tagId,
    });

    databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: false,
    });

    databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: true,
    });

    await databaseBuilder.commit();

    // when
    await enableComputeCertificabilityOnScoAefeOrganizations();

    // then
    const organizationFeatures = await knex('organization-features').where({ organizationId });
    expect(organizationFeatures.length).to.equal(1);
    expect(organizationFeatures[0].organizationId).to.equal(organizationId);
  });
});
