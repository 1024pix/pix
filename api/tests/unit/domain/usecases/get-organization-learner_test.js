import { expect, sinon } from '../../../test-helper';
import getOrganizationLearner from '../../../../lib/domain/usecases/get-organization-learner';
import OrganizationLearner from '../../../../lib/domain/read-models/organization-learner-follow-up/OrganizationLearner';

describe('Unit | UseCase | get-organisation-learner', function () {
  it('should return organization learner matching the given organizationLearnerId', async function () {
    // given
    const organizationLearnerId = 1234;

    const repositoryOrganizationLearner = new OrganizationLearner({
      id: organizationLearnerId,
      firstName: 'Michael',
      lastName: 'Jackson',
    });
    const organizationLearnerRepository = {
      get: sinon.stub().resolves(repositoryOrganizationLearner),
    };

    // when
    const organizationLearner = await getOrganizationLearner({
      organizationLearnerId,
      organizationLearnerFollowUpRepository: organizationLearnerRepository,
    });

    // then
    expect(organizationLearnerRepository.get).to.have.been.calledWith(organizationLearnerId);
    expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
    expect(organizationLearner.firstName).to.be.equal('Michael');
    expect(organizationLearner.lastName).to.be.equal('Jackson');
  });
});
