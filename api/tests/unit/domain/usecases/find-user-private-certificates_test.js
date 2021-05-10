const { expect, sinon, domainBuilder } = require('../../../test-helper');
const findUserPrivateCertificates = require('../../../../lib/domain/usecases/find-user-private-certificates');

describe('Unit | UseCase | find-user-private-certificates', () => {

  const privateCertificateRepository = {};

  beforeEach(() => {
    privateCertificateRepository.findByUserId = sinon.stub();
  });

  it('should return the private certificates', async () => {
    // given
    const privateCertificate1 = domainBuilder.buildPrivateCertificate();
    const privateCertificate2 = domainBuilder.buildPrivateCertificate();
    privateCertificateRepository.findByUserId
      .withArgs({ userId: 123 })
      .resolves([privateCertificate1, privateCertificate2]);

    // when
    const privateCertificates = await findUserPrivateCertificates({ userId: 123, privateCertificateRepository });

    // then
    expect(privateCertificates).to.deep.equal([privateCertificate1, privateCertificate2]);
  });
});
