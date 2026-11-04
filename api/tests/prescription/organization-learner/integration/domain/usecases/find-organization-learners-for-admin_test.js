import { expect } from 'chai';

import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-paginated-filtered-organization-learners-for-admin', function () {
  it('returns paginated and filtered organization learners', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization({
      externalId: 'ORGANIZATION_EXTERNAL_ID',
    });
    // name / orga matching learner
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'LearnerA',
      lastName: 'Michel',
      organizationId: organization.id,
    });
    // id matching learner
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'LearnerB',
      lastName: 'Michel',
      organizationId: organization.id,
    });
    // disabled learner
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'LearnerC',
      lastName: 'Michel',
      organizationId: organization.id,
      isDisabled: true,
    });
    // not matching learner
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'LearnerD',
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
        organizationLearnerId: learner.id,
        organizationExternalId: 'organization_external_id',
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
