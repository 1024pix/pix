const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getPrescriber = require('../../../../lib/domain/usecases/get-prescriber');
const { UserNotMemberOfOrganizationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-prescriber', () => {

  const userId = 1;
  const expectedResult = Symbol('prescriber');
  let prescriberRepository;
  let membershipRepository;
  let userOrgaSettingsRepository;

  beforeEach(() => {
    prescriberRepository = { getPrescriber: sinon.stub() };
    membershipRepository = { findByUserId: sinon.stub() };
    userOrgaSettingsRepository = { findOneByUserId: sinon.stub(), create: sinon.stub(), update: sinon.stub() };
  });

  context('When user is not a member of any organization', () => {
    it('should throw UserNotMemberOfOrganizationError', async () => {
      // given
      membershipRepository.findByUserId.withArgs({ userId }).resolves([]);

      // when
      const error = await catchErr(getPrescriber)({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotMemberOfOrganizationError);
      expect(error.message).to.equal('L’utilisateur 1 n’est membre d’aucune organisation.');
    });
  });

  context('When user does not have userOrgaSettings yet', () => {
    it('should create userOrgaSettings', async () => {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership1 = domainBuilder.buildMembership({ user });
      const membership2 = domainBuilder.buildMembership({ user });
      membershipRepository.findByUserId.withArgs({ userId }).resolves([membership1, membership2]);
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(null);

      // when
      await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(userOrgaSettingsRepository.create).to.have.been.calledWithExactly(userId, membership1.organization.id);
    });

    it('should return prescriber', async () => {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      membershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(null);
      prescriberRepository.getPrescriber.withArgs(userId).resolves(expectedResult);

      // when
      const result = await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  context('When user already has userOrgaSettings', () => {
    it('should not create userOrgaSettings', async () => {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      membershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings({ currentOrganization: membership.organisation, user: membership.user });
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);

      // when
      await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(userOrgaSettingsRepository.create).to.not.have.been.called;
    });

    it('should return prescriber', async () => {
      // given
      const user = domainBuilder.buildUser({ id: userId });
      const membership = domainBuilder.buildMembership({ user });
      membershipRepository.findByUserId.withArgs({ userId }).resolves([membership]);
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings({ currentOrganization: membership.organisation, user: membership.user });
      userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);
      prescriberRepository.getPrescriber.withArgs(userId).resolves(expectedResult);

      // when
      const result = await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    context('When userOrgaSettings doest not belongs to user\'s memberships anymore', () => {

      it('should not update userOrgaSettings', async () => {
        // given
        const user = domainBuilder.buildUser({ id: userId });
        const membership1 = domainBuilder.buildMembership({ user });
        const membership2 = domainBuilder.buildMembership({ user });
        membershipRepository.findByUserId.withArgs({ userId }).resolves([membership1, membership2]);
        const outdatedOrganization = domainBuilder.buildOrganization();
        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({ currentOrganization: outdatedOrganization, user });
        userOrgaSettingsRepository.findOneByUserId.withArgs(userId).resolves(userOrgaSettings);

        // when
        await getPrescriber({
          userId,
          prescriberRepository,
          membershipRepository,
          userOrgaSettingsRepository,
        });

        // then
        expect(userOrgaSettingsRepository.update).to.have.been.calledWithExactly(userId, membership1.organization.id);
      });
    });
  });
});
