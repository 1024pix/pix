import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/services/get-certificates-for-session.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | service | get-certificates-for-session', function () {
  let certificateRepository, sharedCertificationCourseRepository;

  beforeEach(function () {
    certificateRepository = {
      getCertificate: sinon.stub(),
    };
    sharedCertificationCourseRepository = {
      findCertificationCoursesBySessionId: sinon.stub(),
    };
  });

  it('should return multiple certificates for V3', async function () {
    // given
    const locale = 'en';
    const i18nStub = { getLocale: sinon.stub().returns(locale) };
    const generatedPDF = Symbol('pdf');

    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);

    const certificationCourse1 = domainBuilder.buildCertificationCourse({
      id: 1,
      sessionId: 11,
    });
    const certificate1 = domainBuilder.certification.results.buildCertificate({
      id: 1,
    });

    const certificationCourse2 = domainBuilder.buildCertificationCourse({
      id: 2,
      sessionId: 11,
    });
    const certificate2 = domainBuilder.certification.results.buildCertificate({
      id: 2,
    });

    sharedCertificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 11 })
      .resolves([certificationCourse1, certificationCourse2]);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 1, locale }).resolves(certificate1);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 2, locale }).resolves(certificate2);

    // when
    const { filename, content } = await getCertificatesForSession({
      sessionId: 11,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
        certificateRepository,
        sharedCertificationCourseRepository,
      },
    });

    // then
    expect(filename).to.deep.equal('session-11-pix-certificates.pdf');
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
    const i18nStub = { getLocale: sinon.stub().returns(locale) };
    const generatedPDF = Symbol('pdf');

    const getCertificatesPDFStub = sinon.stub().returns(generatedPDF);

    const certificationCourse1 = domainBuilder.buildCertificationCourse({
      id: 1,
      sessionId: 11,
    });
    const certificate1 = domainBuilder.buildCertificationAttestation({
      id: 1,
    });

    const certificationCourse2 = domainBuilder.buildCertificationCourse({
      id: 2,
      sessionId: 11,
    });
    const certificate2 = domainBuilder.buildCertificationAttestation({
      id: 2,
    });

    sharedCertificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 11 })
      .resolves([certificationCourse1, certificationCourse2]);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 1, locale }).resolves(certificate1);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 2, locale }).resolves(certificate2);

    // when
    const { filename, content } = await getCertificatesForSession({
      sessionId: 11,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesPDF: getCertificatesPDFStub,
        certificateRepository,
        sharedCertificationCourseRepository,
      },
    });

    // then
    expect(filename).to.deep.equal('session-11-pix-certificates.pdf');
    expect(content).to.deep.equal(generatedPDF);
    expect(getCertificatesPDFStub).to.have.been.calledOnceWithExactly({
      certificates: [certificate1, certificate2],
      algorithmEngineVersion: AlgorithmEngineVersion.V2,
      i18n: i18nStub,
      isFrenchDomainExtension: true,
    });
  });

  describe('when there is no certification courses for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.certification.sessionManagement.buildSessionManagement({
        id: 12,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });

      sharedCertificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 12 }).resolves([]);

      // when
      const error = await catchErr(getCertificatesForSession)({
        sessionId: 12,
        dependencies: {
          certificateRepository,
          sharedCertificationCourseRepository,
        },
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('when there is no certificate for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.certification.sessionManagement.buildSessionManagement({
        id: 13,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: 3,
        sessionId: 11,
        userId: 101,
      });

      sharedCertificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 13 })
        .resolves([certificationCourse]);
      certificateRepository.getCertificate.withArgs({ certificationCourseId: 3, locale: 'fr' }).resolves();

      // when
      const error = await catchErr(getCertificatesForSession)({
        sessionId: 13,
        i18n: { getLocale: sinon.stub().returns('fr') },
        dependencies: {
          certificateRepository,
          sharedCertificationCourseRepository,
        },
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
