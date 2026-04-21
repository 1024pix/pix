import sinon from 'sinon';

import { findOrganizationLearnersBeforeImportFeature } from '../../../../../../src/prescription/learner-management/domain/usecases/find-organization-learners-before-import-feature.js';

describe('Unit | UseCase | Organization Learners Management | findOrganizationLearnersBeforeImportFeature', function () {
  let organizationLearnerRepository;
  let organizationId;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    organizationLearnerRepository = {
      findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId: sinon.stub(),
    };
  });

  it('return data given from repository', async function () {
    // given
    const organizationLearnerIds = Symbol('organizationLearnerIds');
    organizationLearnerRepository.findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId
      .withArgs({ organizationId })
      .returns(organizationLearnerIds);

    // when
    const result = await findOrganizationLearnersBeforeImportFeature({
      organizationId,
      organizationLearnerRepository,
    });

    expect(result).to.be.equal(organizationLearnerIds);
  });
});
