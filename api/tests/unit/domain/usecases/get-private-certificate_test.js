import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import { NotFoundError } from '../../../../lib/domain/errors';
import getPrivateCertificate from '../../../../lib/domain/usecases/certificate/get-private-certificate';

describe('Unit | UseCase | getPrivateCertificate', function () {
  const certificateRepository = {
    getPrivateCertificate: () => undefined,
  };

  beforeEach(function () {
    certificateRepository.getPrivateCertificate = sinon.stub();
  });

  context('when the user is not owner of the certification', function () {
    it('should throw an error if user is not the owner of the certificate', async function () {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 789,
      });
      const locale = 'fr';
      certificateRepository.getPrivateCertificate.withArgs(123, { locale }).resolves(privateCertificate);

      // when
      const error = await catchErr(getPrivateCertificate)({
        certificationId: 123,
        userId: 456,
        locale,
        certificateRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification', function () {
    it('should get the private certificate', async function () {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
      });
      const locale = 'fr';
      certificateRepository.getPrivateCertificate.withArgs(123, { locale }).resolves(privateCertificate);

      // when
      const actualPrivateCertificate = await getPrivateCertificate({
        certificationId: 123,
        userId: 456,
        locale,
        certificateRepository,
      });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
      });
      expect(actualPrivateCertificate).to.deep.equal(expectedPrivateCertificate);
    });
  });
});
