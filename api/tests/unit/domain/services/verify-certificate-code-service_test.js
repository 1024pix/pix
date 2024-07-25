import _ from 'lodash';

import * as verifyCertificateCodeService from '../../../../lib/domain/services/verify-certificate-code-service.js';
import { CertificateVerificationCodeGenerationTooManyTrials } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | Service | VerifyCertificateCode', function () {
  describe('#generateCertificateVerificationCode', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    _.times(100, () =>
      it('should return a certification code containing 8 digits/letters except 0, 1 and vowels', async function () {
        // given
        const certificationCourseRepositoryStub = {
          isVerificationCodeAvailable: sinon.stub().resolves(true),
        };

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode({
          dependencies: { certificationCourseRepository: certificationCourseRepositoryStub },
        });

        // then
        expect(result).to.match(/^P-[2346789BCDFGHJKMPQRTVWXY]{8}$/);
      }),
    );

    context('when a code is not available', function () {
      it('should choose another code', async function () {
        // given
        let codeIndex = 0;
        const codes = ['P-FXRSTX', 'P-SXCXND'];
        const fakeGenerateCode = () => codes[codeIndex++];
        // given
        const certificationCourseRepositoryStub = {
          isVerificationCodeAvailable: sinon.stub().onCall(0).resolves(false).onCall(1).resolves(true),
        };

        // when
        const result = await verifyCertificateCodeService.generateCertificateVerificationCode({
          generateCode: fakeGenerateCode,
          dependencies: { certificationCourseRepository: certificationCourseRepositoryStub },
        });

        // then
        expect(result).to.equal('P-SXCXND');
      });

      it('should throw when trying too many times', async function () {
        // given
        const certificationCourseRepositoryStub = {
          isVerificationCodeAvailable: sinon.stub().resolves(false),
        };

        // when
        const error = await catchErr(verifyCertificateCodeService.generateCertificateVerificationCode)({
          dependencies: { certificationCourseRepository: certificationCourseRepositoryStub },
        });

        //then
        expect(error).to.be.instanceof(CertificateVerificationCodeGenerationTooManyTrials);
        expect(certificationCourseRepositoryStub.isVerificationCodeAvailable).to.have.been.callCount(1000);
      });
    });
  });
});
