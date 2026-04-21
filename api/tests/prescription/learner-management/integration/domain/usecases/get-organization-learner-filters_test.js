import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | Learner Management | get-organization-learner-filters', function () {
  it('should return the filters for the given organization', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
      organizationId,
      attributeName: 'division',
      values: ['6A', '6B'],
    });
    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
      organizationId,
      attributeName: 'status',
      values: ['active', 'inactive'],
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getOrganizationLearnerFilters({ organizationId });

    // then
    expect(result).lengthOf(2);
    expect(result.map((r) => r.attributeName)).to.have.members(['division', 'status']);
  });

  it('should not return filters from another organization', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
      organizationId: anotherOrganizationId,
      attributeName: 'division',
      values: ['6A'],
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getOrganizationLearnerFilters({ organizationId });

    // then
    expect(result).lengthOf(0);
  });
});
