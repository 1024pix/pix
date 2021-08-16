const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getPrivateCertificate = require('../../../../lib/domain/usecases/certificate/get-private-certificate');

describe('Unit | UseCase | getPrivateCertificate', async () => {
  const privateCertificateRepository = {
    get: () => undefined,
  };

  beforeEach(() => {
    privateCertificateRepository.get = sinon.stub();
  });

  context('when the user is not owner of the certification', async () => {

    it('should throw an error if user is not the owner of the certificate', async () => {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 789,
      });
      privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);

      // when
      const error = await catchErr(getPrivateCertificate)({ certificationId: 123, userId: 456, privateCertificateRepository });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification', async () => {

    it('should get the private certificate', async () => {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
      });
      privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);

      // when
      const actualPrivateCertificate = await getPrivateCertificate({ certificationId: 123, userId: 456, privateCertificateRepository });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
      });
      expect(actualPrivateCertificate).to.deep.equal(expectedPrivateCertificate);
    });
  });
});
