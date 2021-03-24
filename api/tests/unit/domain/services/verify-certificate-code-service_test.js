const { expect, sinon, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const verifyCertificateCodeService = require('../../../../lib/domain/services/verify-certificate-code-service');
const certifCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const { CertificateVerificationCodeGenerationTooManyTrials } = require('../../../../lib/domain/errors');

describe('Unit | Service | VerifyCertificateCode', function() {

  describe('#generateCertificateVerificationCode', function() {

    _.times(100, () =>
      it('should return a certification code containing 8 digits/letters except 0, 1 and vowels', async function() {
        // given
        sinon.stub(certifCourseRepository, 'isVerificationCodeAvailable').resolves(true);

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode();

        // then
        expect(result).to.match(/^P-[2346789BCDFGHJKMPQRTVWXY]{8}$/);
      }),
    );

    context('when a code is not available', function() {
      it('should choose another code', async function() {
        // given
        let codeIndex = 0;
        const codes = ['P-FXRSTX', 'P-SXCXND'];
        const fakeGenerateCode = () => codes[codeIndex++];

        sinon.stub(certifCourseRepository, 'isVerificationCodeAvailable')
          .onCall(0).resolves(false)
          .onCall(1).resolves(true);

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode(fakeGenerateCode);

        // then
        expect(result).to.equal('P-SXCXND');
      });

      it('should throw when trying too many times', async function() {
        // given
        sinon.stub(certifCourseRepository, 'isVerificationCodeAvailable').resolves(false);

        // when
        const error = await catchErr(verifyCertificateCodeService.generateCertificateVerificationCode)();

        //then
        expect(error).to.be.instanceof(CertificateVerificationCodeGenerationTooManyTrials);
        expect(certifCourseRepository.isVerificationCodeAvailable).to.have.been.callCount(1000);
      });
    });
  });
});
