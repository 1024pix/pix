import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import acceptCertificationCenterInvitation from '../../../../lib/domain/usecases/accept-certification-center-invitation';
import CertificationCenterInvitedUser from '../../../../lib/domain/models/CertificationCenterInvitedUser';
import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';
import { AlreadyExistingMembershipError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | accept-certification-center-invitation', function () {
  it('should return the user invitation', async function () {
    // given
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
    const user = domainBuilder.buildUser({ email });

    const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
      userId: user.id,
      invitation: { code, id: certificationCenterInvitation.id },
      status: CertificationCenterInvitation.StatusType.PENDING,
    });
    certificationCenterInvitedUserRepository.get.resolves(certificationCenterInvitedUser);
    certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(false);

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterInvitedUserRepository.get).to.have.been.calledWith({
      certificationCenterInvitationId: 1234,
      email: 'user@example.net',
    });
  });

  it('should throw an error if user is already member of the certification center', async function () {
    // given
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
    const user = domainBuilder.buildUser({ email });

    const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
      userId: user.id,
      invitation: { code, id: certificationCenterInvitation.id, certificationCenterId },
      status: CertificationCenterInvitation.StatusType.PENDING,
    });
    certificationCenterInvitedUserRepository.get.resolves(certificationCenterInvitedUser);
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
      `Certification center membership already exists for the user ID ${user.id} and certification center ID ${certificationCenterId}.`
    );
    expect(error).to.be.an.instanceof(AlreadyExistingMembershipError);
  });

  it('should update the invitation status to accepted with date and create a membership for the user', async function () {
    // given
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
    const user = domainBuilder.buildUser({ email });

    const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
      userId: user.id,
      invitation: { code, id: certificationCenterInvitation.id },
      status: CertificationCenterInvitation.StatusType.PENDING,
    });
    certificationCenterInvitedUserRepository.get.resolves(certificationCenterInvitedUser);

    sinon.stub(certificationCenterInvitedUser, 'acceptInvitation').resolves();
    certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(false);

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      certificationCenterInvitedUserRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterInvitedUserRepository.save).to.have.been.calledWith(certificationCenterInvitedUser);
  });
});
