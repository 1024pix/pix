import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificatePDF } from '../../../../../../src/certification/results/domain/usecases/get-certificate-pdf.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-certificate-pdf', function () {
  it('should return PDF and filename (v3)', async function () {
    // given
    const locale = 'fr';
    const certificate = domainBuilder.certification.results.buildCertificate({ deliveredAt: new Date('2026-10-30') });
    const generatedPDF = Symbol('pdf');

    const certificateRepository = { getCertificate: sinon.stub().returns(certificate) };
    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);
    const i18nStub = { getLocale: sinon.stub().returns(locale), __: sinon.stub().returns('filename') };

    // when
    const { filename, content } = await getCertificatePDF({
      certificationCourseId: 123,
      i18n: i18nStub,
      certificateRepository,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
      },
    });

    // then
    expect(certificateRepository.getCertificate).to.be.calledOnceWith({ certificationCourseId: 123, locale });
    expect(getCertificatesPDFStub).to.be.calledOnceWith({
      certificates: [certificate],
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      algorithmEngineVersion: AlgorithmEngineVersion.V3,
    });
    expect(content).to.equal(generatedPDF);
    expect(filename).to.equal('filename');
  });

  it('should return PDF and filename (v2)', async function () {
    // given
    const locale = 'fr';
    const certificate = domainBuilder.buildCertificationAttestation({
      algorithmEngineVersion: AlgorithmEngineVersion.V2,
      deliveredAt: new Date('2026-10-30'),
    });
    const generatedPDF = Symbol('pdf');

    const certificateRepository = { getCertificate: sinon.stub().returns(certificate) };
    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);
    const i18nStub = { getLocale: sinon.stub().returns(locale), __: sinon.stub().returns('filename') };

    // when
    const { filename, content } = await getCertificatePDF({
      certificationCourseId: 123,
      i18n: i18nStub,
      certificateRepository,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
      },
    });

    // then
    expect(certificateRepository.getCertificate).to.be.calledOnceWith({ certificationCourseId: 123, locale });
    expect(getCertificatesPDFStub).to.be.calledOnceWith({
      certificates: [certificate],
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      algorithmEngineVersion: AlgorithmEngineVersion.V2,
    });
    expect(content).to.equal(generatedPDF);
    expect(filename).to.equal('filename');
  });

  describe('when there is no certificate', function () {
    it('should throw an error', async function () {
      // given
      const locale = 'fr';

      const certificateRepository = { getCertificate: sinon.stub().returns(null) };
      const i18nStub = { getLocale: sinon.stub().returns(locale) };

      // when
      const error = await catchErr(getCertificatePDF)({
        certificationCourseId: 123,
        i18n: i18nStub,
        certificateRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
