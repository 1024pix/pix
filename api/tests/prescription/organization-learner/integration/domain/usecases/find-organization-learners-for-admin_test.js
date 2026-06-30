import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-paginated-filtered-organization-learners-for-admin', function () {
  it('should return paginated organization learners filtered by name', async function () {
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
    });
    const learner2 = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jeanne-Michelle',
      lastName: 'René',
    });
    const learner3 = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Michel',
      lastName: 'michel',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
    });
    await databaseBuilder.commit();

    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: { fullName: 'michel' },
    });
    const result2 = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 2,
      },
      filter: { fullName: 'michel' },
    });

    const learners = result.learners;
    const learners2 = result2.learners;

    expect(learners).lengthOf(2);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[1]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
    expect(learners[1].id).to.be.equal(learner2.id);

    expect(learners2).lengthOf(1);
    expect(learners2[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners2[0].id).to.be.equal(learner3.id);
  });

  it('should return paginated organization learners filtered by organizationId', async function () {
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
      organizationId,
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
    });
    await databaseBuilder.commit();

    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: { organizationId },
    });
    const learners = result.learners;

    expect(learners).lengthOf(1);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
  });
});
