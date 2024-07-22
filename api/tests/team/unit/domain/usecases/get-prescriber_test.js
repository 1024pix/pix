import { UserNotMemberOfOrganizationError } from '../../../../../src/shared/domain/errors.js';
import { getPrescriber } from '../../../../../src/team/domain/usecases/get-prescriber.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | UseCase | get-prescriber', function () {
  const userId = 1;
  let prescriberRepository;
  let sharedMembershipRepository;
  let userOrgaSettingsRepository;
  let expectedResult;

  beforeEach(function () {
    expectedResult = Symbol('prescriber');
    prescriberRepository = { getPrescriber: sinon.stub() };
    sharedMembershipRepository = { findByUserId: sinon.stub() };
    userOrgaSettingsRepository = { findOneByUserId: sinon.stub(), create: sinon.stub(), update: sinon.stub() };
  });

  context('When user is not a member of any organization', function () {
    it('should throw UserNotMemberOfOrganizationError', async function () {
      // given
      sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([]);

      // when
      const error = await catchErr(getPrescriber)({
        userId,
        prescriberRepository,
        sharedMembershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotMemberOfOrganizationError);
      expect(error.message).to.equal('L’utilisateur 1 n’est membre d’aucune organisation.');
    });
  });

  context('When user does not have userOrgaSettings yet', function () {
    it('should create userOrgaSettings', async function () {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership1 = domainBuilder.buildMembership({ user });
      const membership2 = domainBuilder.buildMembership({ user });
      sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([membership1, membership2]);
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(null);

      // when
      await getPrescriber({
        userId,
        prescriberRepository,
        sharedMembershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(userOrgaSettingsRepository.create).to.have.been.calledWithExactly(userId, membership1.organization.id);
    });

    it('should return prescriber', async function () {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(null);
      prescriberRepository.getPrescriber.withArgs(userId).resolves(expectedResult);

      // when
      const result = await getPrescriber({
        userId,
        prescriberRepository,
        sharedMembershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  context('When user already has userOrgaSettings', function () {
    it('should not create userOrgaSettings', async function () {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
        currentOrganization: membership.organisation,
        user: membership.user,
      });
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);

      // when
      await getPrescriber({
        userId,
        prescriberRepository,
        sharedMembershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(userOrgaSettingsRepository.create).to.not.have.been.called;
    });

    it('should return prescriber', async function () {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
        currentOrganization: membership.organisation,
        user: membership.user,
      });
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);
      prescriberRepository.getPrescriber.withArgs(userId).resolves(expectedResult);

      // when
      const result = await getPrescriber({
        userId,
        prescriberRepository,
        sharedMembershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    context("When userOrgaSettings doest not belongs to user's memberships anymore", function () {
      it('should not update userOrgaSettings', async function () {
        // given
        const user = domainBuilder.buildUser({ id: userId });
        const membership1 = domainBuilder.buildMembership({ user });
        const membership2 = domainBuilder.buildMembership({ user });
        sharedMembershipRepository.findByUserId.withArgs({ userId }).resolves([membership1, membership2]);
        const outdatedOrganization = domainBuilder.buildOrganization();
        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: outdatedOrganization,
          user,
        });
        userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);

        // when
        await getPrescriber({
          userId,
          prescriberRepository,
          sharedMembershipRepository,
          userOrgaSettingsRepository,
        });

        // then
        expect(userOrgaSettingsRepository.update).to.have.been.calledWithExactly(userId, membership1.organization.id);
      });
    });
  });
});
