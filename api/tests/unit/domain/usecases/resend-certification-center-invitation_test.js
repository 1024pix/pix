import { expect, sinon } from '../../../test-helper.js';
import { resendCertificationCenterInvitation } from '../../../../lib/domain/usecases/resend-certification-center-invitation.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | UseCases | resendCertificationCenterInvitation', function () {
  it('resends the certification center invitation and returns it', async function () {
    // given
    const locale = 'nl-BE';
    const certificationCenter = domainBuilder.buildCertificationCenter();
    const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
      certificationCenterId: certificationCenter.id,
    });
    const resendCertificationCenterInvitationInjector = sinon.stub();
    const resendCertificationCenterInvitationFn = sinon.stub();
    const certificationCenterInvitationService = {
      resendCertificationCenterInvitation: resendCertificationCenterInvitationInjector.returns(
        resendCertificationCenterInvitationFn,
      ),
    };
    const certificationCenterRepository = {
      get: sinon.stub(),
    };
    const certificationCenterInvitationRepository = {
      get: sinon.stub(),
    };

    resendCertificationCenterInvitationInjector.withArgs({ certificationCenterInvitationRepository });
    resendCertificationCenterInvitationFn.withArgs({ certificationCenter, certificationCenterInvitation, locale });
    certificationCenterInvitationRepository.get.resolves(certificationCenterInvitation);
    certificationCenterRepository.get.resolves(certificationCenter);

    // when
    const result = await resendCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      locale,
      certificationCenterInvitationRepository,
      certificationCenterRepository,
      certificationCenterInvitationService,
    });

    // then
    expect(certificationCenterInvitationRepository.get).to.have.been.calledTwice;
    expect(certificationCenterRepository.get).to.have.been.called;
    expect(certificationCenterInvitationService.resendCertificationCenterInvitation).to.have.been.called;
    expect(result).to.equals(certificationCenterInvitation);
  });
});
