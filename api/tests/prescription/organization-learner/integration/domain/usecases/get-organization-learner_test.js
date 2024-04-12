import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearner.js';
import { getOrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/usecases/get-organization-learner.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCases | get-organization-learner', function () {
  it('should return organization learner given organizationLearnerId', async function () {
    // given
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Itachi',
      lastName: 'Uchiwa',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Kakashi',
      lastName: 'Hatake',
    });
    await databaseBuilder.commit();

    // when
    const organizationLearner = await getOrganizationLearner({
      organizationLearnerId: learner.id,
      organizationLearnerRepository,
    });

    // then
    expect(organizationLearner.id).to.be.equal(learner.id);
    expect(organizationLearner.firstName).to.be.equal(learner.firstName);
    expect(organizationLearner.lastName).to.be.equal(learner.lastName);
    expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
  });
});
