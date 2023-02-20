import { expect, sinon, catchErr } from '../../../test-helper';
import _ from 'lodash';
import verifyCertificateCodeService from '../../../../lib/domain/services/verify-certificate-code-service';
import certifCourseRepository from '../../../../lib/infrastructure/repositories/certification-course-repository';
import { CertificateVerificationCodeGenerationTooManyTrials } from '../../../../lib/domain/errors';

describe('Unit | Service | VerifyCertificateCode', function () {
  describe('#generateCertificateVerificationCode', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    _.times(100, () =>
      it('should return a certification code containing 8 digits/letters except 0, 1 and vowels', async function () {
        // given
        sinon.stub(certifCourseRepository, 'isVerificationCodeAvailable').resolves(true);

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode();

        // then
        expect(result).to.match(/^P-[2346789BCDFGHJKMPQRTVWXY]{8}$/);
      })
    );

    context('when a code is not available', function () {
      it('should choose another code', async function () {
        // given
        let codeIndex = 0;
        const codes = ['P-FXRSTX', 'P-SXCXND'];
        const fakeGenerateCode = () => codes[codeIndex++];

        sinon
          .stub(certifCourseRepository, 'isVerificationCodeAvailable')
          .onCall(0)
          .resolves(false)
          .onCall(1)
          .resolves(true);

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode(fakeGenerateCode);

        // then
        expect(result).to.equal('P-SXCXND');
      });

      it('should throw when trying too many times', async function () {
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
