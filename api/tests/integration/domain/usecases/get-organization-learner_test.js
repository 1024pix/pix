import { expect, databaseBuilder } from '../../../test-helper';
import organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-follow-up/organization-learner-repository';
import OrganizationLearner from '../../../../lib/domain/read-models/organization-learner-follow-up/OrganizationLearner';
import getOrganizationLearner from '../../../../lib/domain/usecases/get-organization-learner';

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
      organizationLearnerFollowUpRepository: organizationLearnerRepository,
    });

    // then
    expect(organizationLearner.id).to.be.equal(learner.id);
    expect(organizationLearner.firstName).to.be.equal(learner.firstName);
    expect(organizationLearner.lastName).to.be.equal(learner.lastName);
    expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
  });
});
