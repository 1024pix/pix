import { AlreadyExistingMembershipError } from '../../../../lib/domain/errors.js';
import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';
import { CertificationCenterInvitedUser } from '../../../../lib/domain/models/CertificationCenterInvitedUser.js';
import { acceptCertificationCenterInvitation } from '../../../../lib/domain/usecases/accept-certification-center-invitation.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | accept-certification-center-invitation', function () {
  it('should throw an error if user is already member of the certification center', async function () {
    const {
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
      code,
      email,
      certificationCenterInvitation,
      user,
    } = _buildInvitationContext();

    certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(true);

    // when
    const error = await catchErr(acceptCertificationCenterInvitation)({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(error.message).to.equal(
      `Certification center membership already exists for the user ID ${user.id} and certification center ID 1234.`,
    );
    expect(error).to.be.an.instanceof(AlreadyExistingMembershipError);
  });

  it('sets the user locale if there is a localeFromCookie, updates the invitation status to accepted with date and creates a membership for the user', async function () {
    // given
    const localeFromCookie = 'fr-BE';
    const {
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
      code,
      email,
      certificationCenterInvitation,
      user,
      certificationCenterInvitedUser,
      userRepository,
    } = _buildInvitationContext();

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      localeFromCookie,
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(certificationCenterInvitedUserRepository.save).to.have.been.calledWith(certificationCenterInvitedUser);
    expect(userRepository.update).to.have.been.calledWith({ id: user.id, locale: 'fr-BE' });
  });

  it('does not sets the user locale if there is not a localeFromCookie, updates the invitation status to accepted with date and creates a membership for the user', async function () {
    // given
    const localeFromCookie = null;
    const {
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
      code,
      email,
      certificationCenterInvitation,
      userRepository,
    } = _buildInvitationContext();

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      localeFromCookie,
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(userRepository.update).not.to.have.been.called;
  });
});

function _buildInvitationContext() {
  const certificationCenterInvitedUserRepository = {
    get: sinon.stub(),
    save: sinon.stub(),
  };
  const certificationCenterMembershipRepository = {
    isMemberOfCertificationCenter: sinon.stub(),
  };
  const code = 'SDFGH123';
  const email = 'user@example.net';
  const certificationCenterId = domainBuilder.buildCertificationCenter().id;
  const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
    id: 1234,
    certificationCenterId,
  });
  const user = domainBuilder.buildUser({ email, locale: null });

  const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
    userId: user.id,
    invitation: { code, certificationCenterId: certificationCenterInvitation.id },
    status: CertificationCenterInvitation.StatusType.PENDING,
  });
  certificationCenterInvitedUserRepository.get
    .withArgs({ certificationCenterInvitationId: certificationCenterInvitation.id, email })
    .resolves(certificationCenterInvitedUser);

  sinon.stub(certificationCenterInvitedUser, 'acceptInvitation').resolves();
  certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(false);

  const userRepository = {
    getById: sinon.stub(),
    update: sinon.stub(),
  };
  userRepository.getById.resolves(user);
  return {
    certificationCenterInvitedUserRepository,
    certificationCenterMembershipRepository,
    code,
    email,
    certificationCenterInvitation,
    user,
    certificationCenterInvitedUser,
    userRepository,
  };
}
