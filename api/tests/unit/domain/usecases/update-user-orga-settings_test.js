const updateUserOrgaSettings = require('../../../../lib/domain/usecases/update-user-orga-settings');
const { expect, catchErr, sinon } = require('../../../test-helper');
const { UserNotMemberOfOrganizationError } = require('../../../../lib/domain/errors');
const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Unit | UseCase | update-user-orga-settings', () => {

  const userId = 1;
  const organizationId = 3;

  beforeEach(() => {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
    sinon.stub(userOrgaSettingsRepository, 'update');
  });

  it('should update the user orga settings', async () => {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([{}]);

    // when
    await updateUserOrgaSettings({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

    // then
    expect(userOrgaSettingsRepository.update).to.have.been.calledWithExactly(userId, organizationId);
  });

  it('should throw a UserNotMemberOfOrganizationError if user is not member of the organization', async () => {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([]);

    // when
    const error = await catchErr(updateUserOrgaSettings)({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

    // then
    expect(error).to.be.an.instanceof(UserNotMemberOfOrganizationError);
    expect(error.message).to.equal(`L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`);
  });
});
