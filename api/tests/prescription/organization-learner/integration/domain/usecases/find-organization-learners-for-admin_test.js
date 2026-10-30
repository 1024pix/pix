import { expect } from 'chai';

import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-paginated-filtered-organization-learners-for-admin', function () {
  it('should return paginated organization learners filtered', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization({
      externalId: 'ORGANIZATION_EXTERNAL_ID',
    });
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean-René',
      lastName: 'Michel',
      organizationId: organization.id,
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jeanne-Michelle',
      lastName: 'René',
      isDisabled: true,
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Jean',
      lastName: 'Dion',
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.findOrganizationLearnersForAdmin({
      page: {
        size: 2,
        number: 1,
      },
      filter: {
        fullName: 'michel',
        hideDisabled: true,
      },
    });

    const learners = result.learners;

    // then
    expect(learners).lengthOf(1);
    expect(learners[0]).to.be.an.instanceOf(OrganizationLearnerOverviewForAdmin);
    expect(learners[0].id).to.be.equal(learner.id);
  });
});
