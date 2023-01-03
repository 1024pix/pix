const { expect, databaseBuilder } = require('../../../test-helper');

const organizationLearnerRepository = require('../../../../lib/infrastructure/repositories/organization-learner-repository');
const OrganizationLearner = require('../../../../lib/domain/models/OrganizationLearner');
const getOrganizationLearner = require('../../../../lib/domain/usecases/get-organization-learner');

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
