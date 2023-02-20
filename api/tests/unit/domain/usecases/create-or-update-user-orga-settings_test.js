import createOrUpdateUserOrgaSettings from '../../../../lib/domain/usecases/create-or-update-user-orga-settings';
import { expect, catchErr, sinon } from '../../../test-helper';
import { UserNotMemberOfOrganizationError } from '../../../../lib/domain/errors';
import userOrgaSettingsRepository from '../../../../lib/infrastructure/repositories/user-orga-settings-repository';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';

describe('Unit | UseCase | create-or-update-user-orga-settings', function () {
  const userId = 1;
  const organizationId = 3;

  beforeEach(function () {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
    sinon.stub(userOrgaSettingsRepository, 'createOrUpdate');
  });

  it('should create or update the user orga settings if user is a member of the organization', async function () {
    // given
    membershipRepository.findByUserIdAndOrganizationId.withArgs({ userId, organizationId }).resolves([{}]);

    // when
    await createOrUpdateUserOrgaSettings({ userId, organizationId, userOrgaSettingsRepository, membershipRepository });

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
