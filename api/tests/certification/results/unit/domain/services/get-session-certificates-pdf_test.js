import { expect } from 'chai';
import sinon from 'sinon';

import { getSessionCertificatesPDF } from '../../../../../../src/certification/results/domain/services/get-session-certificates-pdf.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | service | get-session-certificates-pdf', function () {
  let certificateRepository, sessionRepository;

  beforeEach(function () {
    certificateRepository = {
      getCertificate: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
  });

  it('should return multiple certificates for V3', async function () {
    // given
    const locale = 'en';
    const i18nStub = { getLocale: sinon.stub().returns(locale), __: sinon.stub().returns('filename') };
    const generatedPDF = Symbol('pdf');

    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);
    const session = domainBuilder.certification.results.buildSession({ id: 11, certificationIds: [1, 2] });
    const certificate1 = domainBuilder.certification.results.buildCertificate({
      id: 1,
    });
    const certificate2 = domainBuilder.certification.results.buildCertificate({
      id: 2,
    });

    sessionRepository.get.withArgs(11).resolves(session);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 1, locale }).resolves(certificate1);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 2, locale }).resolves(certificate2);

    // when
    const { filename, content } = await getSessionCertificatesPDF({
      sessionId: 11,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
        certificateRepository,
        sessionRepository,
      },
    });

    // then
    expect(filename).to.deep.equal('filename');
    expect(content).to.deep.equal(generatedPDF);
    expect(getCertificatesPDFStub).to.have.been.calledOnceWithExactly({
      certificates: [certificate1, certificate2],
      algorithmEngineVersion: AlgorithmEngineVersion.V3,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
    });
  });

  it('should return multiple certificates for V2', async function () {
    // given
    const locale = 'en';
    const i18nStub = { getLocale: sinon.stub().returns(locale), __: sinon.stub().returns('filename') };
    const generatedPDF = Symbol('pdf');

    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);
    const session = domainBuilder.certification.results.buildSession({ id: 11, certificationIds: [1, 2] });
    const certificate1 = domainBuilder.buildCertificationAttestation({
      id: 1,
    });
    const certificate2 = domainBuilder.buildCertificationAttestation({
      id: 2,
    });

    sessionRepository.get.withArgs(11).resolves(session);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 1, locale }).resolves(certificate1);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 2, locale }).resolves(certificate2);

    // when
    const { filename, content } = await getSessionCertificatesPDF({
      sessionId: 11,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
        certificateRepository,
        sessionRepository,
      },
    });

    // then
    expect(filename).to.deep.equal('filename');
    expect(content).to.deep.equal(generatedPDF);
    expect(getCertificatesPDFStub).to.have.been.calledOnceWithExactly({
      certificates: [certificate1, certificate2],
      algorithmEngineVersion: AlgorithmEngineVersion.V2,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
    });
  });

  describe('when there is no session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      sessionRepository.get.withArgs(13).resolves(null);

      // when
      const error = await catchErr(getSessionCertificatesPDF)({
        sessionId: 13,
        i18n: { getLocale: sinon.stub().returns('fr') },
        dependencies: {
          sessionRepository,
        },
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('when no certification in the session can produce a certificate', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.certification.sessionManagement.buildSessionManagement({
        id: 12,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });

      const session = domainBuilder.certification.results.buildSession({ id: 12, certificationIds: [] });
      sessionRepository.get.withArgs(12).resolves(session);

      // when
      const error = await catchErr(getSessionCertificatesPDF)({
        sessionId: 12,
        i18n: { getLocale: sinon.stub().returns('fr') },
        dependencies: {
          certificateRepository,
          sessionRepository,
        },
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
