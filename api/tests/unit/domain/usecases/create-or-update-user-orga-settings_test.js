const createOrUpdateUserOrgaSettings = require('../../../../lib/domain/usecases/create-or-update-user-orga-settings');
const { expect, catchErr, sinon } = require('../../../test-helper');
const { UserNotMemberOfOrganizationError } = require('../../../../lib/domain/errors');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Unit | UseCase | create-or-update-user-orga-settings', function () {
  const userId = 1;
  const organizationId = 3;
  let userOrgaSettingsRepository;

  beforeEach(function () {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
    userOrgaSettingsRepository = { createOrUpdate: sinon.stub() };
  });

  it('should create or update the user orga settings if user is a member of the organization', async function () {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([{}]);

    // when
    await createOrUpdateUserOrgaSettings({
      userId,
      organizationId,
      userOrgaSettingsRepository,
      membershipRepository,
    });

    // then
    expect(userOrgaSettingsRepository.createOrUpdate).to.have.been.calledWithExactly({ userId, organizationId });
  });

  it('should throw a UserNotMemberOfOrganizationError if user is not member of the organization', async function () {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([]);

    // when
    const error = await catchErr(createOrUpdateUserOrgaSettings)({
      userId,
      organizationId,
      userOrgaSettingsRepository,
      membershipRepository,
    });

    // then
    expect(error).to.be.an.instanceof(UserNotMemberOfOrganizationError);
    expect(error.message).to.equal(`L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`);
  });
});
