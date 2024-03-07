import { enableComputeCertificabilityOnScoOrganizationsThatManageStudents } from '../../../../scripts/prod/enable-compute-certificability-on-sco-organizations-that-manage-students.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Scripts | enable-compute-certificability-on-sco-organizations-that-manages-students_test.js', function () {
  it('should enable COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY feature on organizations of type SCO with isManagingStudents to true', async function () {
    // given
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
    const organizationId = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: true,
    }).id;
    databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      isManagingStudents: false,
    });
    databaseBuilder.factory.buildOrganization({
      type: 'PRO',
    });
    databaseBuilder.factory.buildOrganization({
      type: 'SUP',
      isManagingStudents: true,
    });
    databaseBuilder.factory.buildOrganization({
      type: 'SUP',
      isManagingStudents: false,
    });
    await databaseBuilder.commit();

    // when
    await enableComputeCertificabilityOnScoOrganizationsThatManageStudents();

    // then
    const organizationFeatures = await knex('organization-features').where({ organizationId });
    expect(organizationFeatures.length).to.equal(1);
    expect(organizationFeatures[0].organizationId).to.equal(organizationId);
  });
});
