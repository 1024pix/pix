import { findUserPrivateCertificates } from '../../../../../../src/certification/results/domain/usecases/find-user-private-certificates.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Results | Domain | Usecases | find-user-private-certificates', function () {
  const certificateRepository = {};

  beforeEach(function () {
    certificateRepository.findPrivateCertificatesByUserId = sinon.stub();
  });

  it('should return the private certificates', async function () {
    // given
    const privateCertificate1 = domainBuilder.buildPrivateCertificate();
    const privateCertificate2 = domainBuilder.buildPrivateCertificate();
    certificateRepository.findPrivateCertificatesByUserId
      .withArgs({ userId: 123 })
      .resolves([privateCertificate1, privateCertificate2]);

    // when
    const privateCertificates = await findUserPrivateCertificates({ userId: 123, certificateRepository });

    // then
    expect(privateCertificates).to.deep.equal([privateCertificate1, privateCertificate2]);
  });
});
