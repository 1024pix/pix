const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getPrivateCertificate = require('../../../../lib/domain/usecases/certificate/get-private-certificate');

describe('Unit | UseCase | getPrivateCertificate', async () => {

  const certificationRepository = {
    hasVerificationCode: undefined,
    saveVerificationCode: undefined,
  };
  const privateCertificateRepository = {
    get: () => undefined,
  };
  const verifyCertificateCodeService = {
    generateCertificateVerificationCode: undefined,
  };

  const dependencies = {
    certificationRepository,
    privateCertificateRepository,
    verifyCertificateCodeService,
  };

  beforeEach(() => {
    privateCertificateRepository.get = sinon.stub();
    verifyCertificateCodeService.generateCertificateVerificationCode = sinon.stub();
    certificationRepository.hasVerificationCode = sinon.stub();
    certificationRepository.saveVerificationCode = sinon.stub();
  });

  context('when the user is not owner of the certification', async () => {

    it('should throw an error if user is not the owner of the certificate', async () => {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 789,
      });
      certificationRepository.hasVerificationCode.withArgs(123).resolves(true);
      privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);

      // when
      const error = await catchErr(getPrivateCertificate)({ certificationId: 123, userId: 456, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification', async () => {
    context('certification has no verification code', () => {

      it('should generate and save a verification code', async () => {
        // given
        const privateCertificate = domainBuilder.buildPrivateCertificate({
          id: 123,
          userId: 456,
        });
        certificationRepository.hasVerificationCode.withArgs(123).resolves(false);
        privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);
        verifyCertificateCodeService.generateCertificateVerificationCode.resolves('P-SOMECODE');
        certificationRepository.saveVerificationCode.resolves();

        // when
        await getPrivateCertificate({ certificationId: 123, userId: 456, ...dependencies });

        // then
        expect(verifyCertificateCodeService.generateCertificateVerificationCode).to.have.been.calledOnce;
        expect(certificationRepository.saveVerificationCode).to.have.been.calledWithExactly(123, 'P-SOMECODE');
      });
    });

    context('certification already has verification code', () => {

      it('should not generate another verification code', async () => {
        // given
        const privateCertificate = domainBuilder.buildPrivateCertificate({
          id: 123,
          userId: 456,
        });
        certificationRepository.hasVerificationCode.withArgs(123).resolves(true);
        privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);
        verifyCertificateCodeService.generateCertificateVerificationCode.rejects(new Error('I should not run.'));
        certificationRepository.saveVerificationCode.resolves(new Error('I should not run.'));

        // when
        await getPrivateCertificate({ certificationId: 123, userId: 456, ...dependencies });

        // then
        expect(verifyCertificateCodeService.generateCertificateVerificationCode).to.not.have.been.called;
        expect(certificationRepository.saveVerificationCode).to.not.have.been.called;
      });
    });

    it('should get the private certificate enhanced with the result competence tree', async () => {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
        resultCompetenceTree,
      });
      certificationRepository.hasVerificationCode.withArgs(123).resolves(true);
      privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);
      verifyCertificateCodeService.generateCertificateVerificationCode.rejects(new Error('I should not run.'));
      certificationRepository.saveVerificationCode.resolves(new Error('I should not run.'));
      privateCertificateRepository.get.withArgs(123).resolves(privateCertificate);

      // when
      const actualPrivateCertificate = await getPrivateCertificate({ certificationId: 123, userId: 456, ...dependencies });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate({
        id: 123,
        userId: 456,
      });
      expectedPrivateCertificate.setResultCompetenceTree(resultCompetenceTree);
      expect(actualPrivateCertificate).to.deep.equal(expectedPrivateCertificate);
    });
  });
});
