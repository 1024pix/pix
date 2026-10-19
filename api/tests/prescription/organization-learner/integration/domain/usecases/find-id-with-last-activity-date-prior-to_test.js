import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-id-with-last-activity-date-prior-to', function () {
  it('returns organization learners IDs', async function () {
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-10'),
    });
    await databaseBuilder.commit();

    const lastActivityDate = new Date('2021-01-01');

    const learnerIds = await usecases.findIdWithLastActivityDatePriorTo({
      organizationId: learner.organizationId,
      lastActivityDate,
    });

    expect(learnerIds).lengthOf(1);
    expect(learnerIds[0]).to.equal(learner.id);
  });
});
