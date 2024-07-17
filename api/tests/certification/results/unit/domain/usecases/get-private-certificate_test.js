import { getPrivateCertificate } from '../../../../../../src/certification/results/domain/usecases/get-private-certificate.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Domain | UseCases | getPrivateCertificate', function () {
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
