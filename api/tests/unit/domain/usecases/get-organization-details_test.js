const { expect, sinon, catchErr } = require('../../../test-helper');
const getOrganizationDetails = require('../../../../lib/domain/usecases/get-organization-details');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-organization-details', () => {

  let userRepository, organizationRepository;

  beforeEach(() => {
    userRepository = {
      get: sinon.stub()
    };

    organizationRepository = {
      get: sinon.stub()
    };
  });

  it('should get the organization if user is PixMaster', async () => {
    // given
    const userId = 1;
    const organizationId = 2;
    userRepository.get.withArgs(userId).resolves({ hasRolePixMaster: true });
    organizationRepository.get.withArgs(organizationId).resolves('ok');

    // when
    const result = await getOrganizationDetails({
      userId, organizationId, userRepository, organizationRepository
    });

    // then
    expect(result).to.equal('ok');
  });

  it('should get the organization if user is the owner of the organization', async () => {
    // given
    const userId = 1;
    const organizationId = 2;
    userRepository.get.withArgs(userId).resolves({ boardOrganizationId: organizationId });
    organizationRepository.get.withArgs(organizationId).resolves('ok');

    // when
    const result = await getOrganizationDetails({
      userId, organizationId, userRepository, organizationRepository
    });

    // then
    expect(result).to.equal('ok');
  });

  it('should throw an error if user has not access to the organization', async () => {
    // given
    const userId = 1;
    const organizationId = 2;
    userRepository.get.withArgs(userId).resolves({});

    // when
    const error = await catchErr(getOrganizationDetails)({
      userId, organizationId, userRepository, organizationRepository
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });
});
