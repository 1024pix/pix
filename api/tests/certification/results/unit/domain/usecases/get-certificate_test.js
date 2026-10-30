import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificate } from '../../../../../../src/certification/results/domain/usecases/get-certificate.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-certificate', function () {
  it('should return the certificate', async function () {
    // given
    const locale = 'fr';
    const certificateRepository = { getCertificate: sinon.stub() };
    const certificationAttestation = Symbol('certificationAttestation');
    certificateRepository.getCertificate
      .withArgs({ certificationCourseId: 123, locale })
      .resolves(certificationAttestation);

    // when
    const actualCertificate = await getCertificate({
      certificationCourseId: 123,
      locale,
      certificateRepository,
    });

    // then
    expect(actualCertificate).to.be.equal(certificationAttestation);
  });

  describe('when there is no certificate', function () {
    it('should throw an error', async function () {
      // given
      const locale = 'fr';
      const certificateRepository = { getCertificate: sinon.stub() };
      certificateRepository.getCertificate.withArgs({ certificationCourseId: 123, locale }).resolves(null);

      // when
      const error = await catchErr(getCertificate)({
        certificationCourseId: 123,
        locale,
        certificateRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
