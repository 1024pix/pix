import { expect, sinon, domainBuilder } from '../../../test-helper';
import findUserPrivateCertificates from '../../../../lib/domain/usecases/find-user-private-certificates';

describe('Unit | UseCase | find-user-private-certificates', function () {
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
