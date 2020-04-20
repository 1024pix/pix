const createOrUpdateUserOrgaSettings = require('../../../../lib/domain/usecases/create-or-update-user-orga-settings');
const { expect, catchErr, sinon } = require('../../../test-helper');
const { UserNotMemberOfOrganizationError } = require('../../../../lib/domain/errors');
const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Unit | UseCase | create-or-update-user-orga-settings', () => {

  const userId = 1;
  const organizationId = 3;

  beforeEach(() => {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
    userOrgaSettingsRepository.findOneByUserId = sinon.stub();
    sinon.stub(userOrgaSettingsRepository, 'update');
    sinon.stub(userOrgaSettingsRepository, 'create');
  });

  it('should create the user orga settings if it doesn\'t exist', async () => {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([{}]);

    // when
    userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves([]);
    await createOrUpdateUserOrgaSettings({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

    // then
    expect(userOrgaSettingsRepository.create).to.have.been.calledWithExactly(userId, organizationId);
  });

  it('should update the user orga settings if it already exists', async () => {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([{}]);

    // when
    userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves([{ id: 22, userId: userId, organizationId: organizationId }]);
    await createOrUpdateUserOrgaSettings({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

    // then
    expect(userOrgaSettingsRepository.update).to.have.been.calledWithExactly(userId, organizationId);
  });

  it('should throw a UserNotMemberOfOrganizationError if user is not member of the organization', async () => {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([]);

    // when
    const error = await catchErr(createOrUpdateUserOrgaSettings)({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

    // then
    expect(error).to.be.an.instanceof(UserNotMemberOfOrganizationError);
    expect(error.message).to.equal(`L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`);
  });
});
