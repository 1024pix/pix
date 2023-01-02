const { expect, sinon } = require('../../../test-helper');
const getOrganizationLearnerActivity = require('../../../../lib/domain/usecases/get-organization-learner-activity');
const OrganizationLearnerParticipation = require('../../../../lib/domain/read-models/OrganizationLearnerParticipation');
const OrganizationLearnerActivity = require('../../../../lib/domain/read-models/OrganizationLearnerActivity');

describe('Unit | UseCase | get-organisation-learner-activity', function () {
  it('should return activity for the organization learner matching the given organizationLearnerId', async function () {
    // given
    const organizationLearnerId = 1234;

    const organizationLearnerParticipation = new OrganizationLearnerParticipation({
      id: 123,
      campaignType: 'ASSESSMENT',
      campaignName: 'My so great campaign',
      createdAt: '01/01/2000',
      sharedAt: '01/01/2010',
      status: 'SHARED',
    });

    const repositoryOrganizationLearnerActivity = new OrganizationLearnerActivity({
      participations: [organizationLearnerParticipation],
    });
    const organizationLearnerActivityRepository = {
      get: sinon.stub().resolves(repositoryOrganizationLearnerActivity),
    };

    // when
    const organizationLearnerActivity = await getOrganizationLearnerActivity({
      organizationLearnerId,
      organizationLearnerActivityRepository,
    });

    // then
    expect(organizationLearnerActivityRepository.get).to.have.been.calledWith(organizationLearnerId);
    expect(organizationLearnerActivity).to.be.an.instanceOf(OrganizationLearnerActivity);
    expect(organizationLearnerActivity.participations.length).to.equal(1);
    expect(organizationLearnerActivity.participations[0]).to.deep.equal(organizationLearnerParticipation);
  });
});
