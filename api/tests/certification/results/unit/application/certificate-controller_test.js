import dayjs from 'dayjs';

import { certificateController } from '../../../../../src/certification/results/application/certificate-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { usecases as certificationSharedUsecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | certificate-controller', function () {
  describe('#getCertificateByVerificationCode', function () {
    describe('when certification course version is V3', function () {
      it('should return serialized V3 certificate data', async function () {
        // given
        const i18n = getI18n();
        const request = { i18n, payload: { verificationCode: 'P-123456BB' } };
        const locale = 'fr-fr';

        const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
        requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

        const certificateSerializerStub = { serialize: sinon.stub() };

        const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V3 });

        sinon.stub(usecases, 'getCertificationCourseByVerificationCode');
        usecases.getCertificationCourseByVerificationCode.resolves(certificationCourse);

        sinon.stub(usecases, 'getCertificate');
        const certificate = Symbol('certificate');
        usecases.getCertificate.resolves(certificate);

        sinon.stub(usecases, 'getShareableCertificate');

        // when
        await certificateController.getCertificateByVerificationCode(request, hFake, {
          requestResponseUtils: requestResponseUtilsStub,
          certificateSerializer: certificateSerializerStub,
        });

        // then
        expect(usecases.getCertificationCourseByVerificationCode).calledOnceWithExactly({
          verificationCode: 'P-123456BB',
        });
        expect(usecases.getCertificate).calledOnceWithExactly({
          certificationCourseId: certificationCourse.getId(),
          locale,
        });
        expect(usecases.getShareableCertificate).to.not.have.been.calledOnce;
      });
    });

    describe('when certification course version is V2', function () {
      it('should return a serialized shareable certificate given by verification code', async function () {
        // given
        const i18n = getI18n();
        const request = { i18n, payload: { verificationCode: 'P-123456BB' } };
        const locale = 'fr-fr';
        const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
        const certificateSerializerStub = { serialize: sinon.stub() };
        sinon.stub(usecases, 'getShareableCertificate');
        sinon.stub(usecases, 'getCertificationCourseByVerificationCode');
        sinon.stub(usecases, 'getCertificate');
        usecases.getShareableCertificate
          .withArgs({ verificationCode: 'P-123456BB', locale })
          .resolves(Symbol('certificate'));
        requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);
        const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V2 });
        usecases.getCertificationCourseByVerificationCode.resolves(certificationCourse);

        // when
        await certificateController.getCertificateByVerificationCode(request, hFake, {
          requestResponseUtils: requestResponseUtilsStub,
          certificateSerializer: certificateSerializerStub,
        });

        // then
        expect(usecases.getCertificationCourseByVerificationCode).calledOnceWithExactly({
          verificationCode: 'P-123456BB',
        });
        expect(usecases.getShareableCertificate).calledOnceWithExactly({
          certificationCourseId: certificationCourse.getId(),
          locale,
        });
        expect(usecases.getCertificate).to.not.have.been.calledOnce;
      });
    });
  });

  describe('#getCertificate', function () {
    describe('when certification course version is V2', function () {
      it('should return a serialized private certificate', async function () {
        // given
        const userId = 1;
        const certificationCourseId = 2;
        const request = {
          auth: { credentials: { userId } },
          params: { certificationCourseId },
          i18n: getI18n(),
        };
        const locale = 'fr-fr';
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          version: AlgorithmEngineVersion.V2,
        });
        const certificate = Symbol('V2 private certificate');
        sinon.stub(certificationSharedUsecases, 'getCertificationCourse');
        certificationSharedUsecases.getCertificationCourse
          .withArgs({ certificationCourseId })
          .resolves(certificationCourse);
        sinon.stub(usecases, 'getPrivateCertificate');
        usecases.getPrivateCertificate.withArgs({ certificationCourseId, locale }).resolves(certificate);

        const privateCertificateSerializerStub = {
          serialize: sinon.stub(),
        };

        const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
        requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

        const dependencies = {
          requestResponseUtils: requestResponseUtilsStub,
          privateCertificateSerializer: privateCertificateSerializerStub,
        };

        // when
        await certificateController.getCertificate(request, hFake, dependencies);

        // then
        const translate = getI18n().__;
        expect(dependencies.privateCertificateSerializer.serialize).to.have.been.calledWithExactly(certificate, {
          translate,
        });
      });
    });

    describe('when certification course version is V3', function () {
      it('should return a serialized certificate', async function () {
        // given
        const userId = 1;
        const certificationCourseId = 2;
        const request = {
          auth: { credentials: { userId } },
          params: { certificationCourseId },
          i18n: getI18n(),
        };

        const locale = 'fr-fr';
        const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
        requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          version: AlgorithmEngineVersion.V3,
        });
        const certificate = Symbol('V3 certificate');

        sinon.stub(certificationSharedUsecases, 'getCertificationCourse');
        certificationSharedUsecases.getCertificationCourse
          .withArgs({ certificationCourseId })
          .resolves(certificationCourse);

        sinon.stub(usecases, 'getCertificate');
        usecases.getCertificate.withArgs({ certificationCourseId, locale }).resolves(certificate);

        const certificateSerializerStub = {
          serialize: sinon.stub(),
        };

        const dependencies = {
          requestResponseUtils: requestResponseUtilsStub,
          certificateSerializer: certificateSerializerStub,
        };

        // when
        await certificateController.getCertificate(request, hFake, dependencies);

        // then
        const translate = getI18n().__;
        expect(dependencies.certificateSerializer.serialize).to.have.been.calledWithExactly({
          translate,
          certificate,
        });
      });
    });
  });

  describe('#findUserCertificates', function () {
    it('should return the serialized private certificates of the user', async function () {
      // given
      const userId = 1;
      const request = { auth: { credentials: { userId } }, i18n: getI18n() };
      const privateCertificate1 = domainBuilder.buildPrivateCertificate.validated({
        id: 123,
        firstName: 'Dorothé',
        lastName: '2Pac',
        birthdate: '2000-01-01',
        birthplace: 'Sin City',
        isPublished: true,
        date: new Date('2020-01-01T00:00:00Z'),
        deliveredAt: new Date('2021-01-01T00:00:00Z'),
        certificationCenter: 'Centre des choux de Bruxelles',
        pixScore: 456,
        commentForCandidate: 'Cette personne est impolie !',
        certifiedBadgeImages: [],
        verificationCode: 'P-SUPERCODE',
        maxReachableLevelOnCertificationDate: 6,
        version: AlgorithmEngineVersion.V3,
      });
      sinon.stub(usecases, 'findUserPrivateCertificates');
      usecases.findUserPrivateCertificates.withArgs({ userId }).resolves([privateCertificate1]);

      // when
      const response = await certificateController.findUserCertificates(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            id: '123',
            type: 'certifications',
            attributes: {
              'first-name': 'Dorothé',
              'last-name': '2Pac',
              birthdate: '2000-01-01',
              birthplace: 'Sin City',
              'certification-center': 'Centre des choux de Bruxelles',
              date: new Date('2020-01-01T00:00:00Z'),
              'delivered-at': new Date('2021-01-01T00:00:00Z'),
              'is-published': true,
              'pix-score': 456,
              status: 'validated',
              'comment-for-candidate': 'Cette personne est impolie !',
              'certified-badge-images': [],
              'verification-code': 'P-SUPERCODE',
              'max-reachable-level-on-certification-date': 6,
              version: AlgorithmEngineVersion.V3,
              'algorithm-engine-version': AlgorithmEngineVersion.V3,
            },
            relationships: {
              'result-competence-tree': {
                data: null,
              },
            },
          },
        ],
      });
    });
  });

  describe('#getPDFCertificate', function () {
    describe('when the attestation is for v3', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { certificationCourseId: 9 },
          query: { lang: 'fr' },
        };

        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: request.params.certificationCourseId,
          userId,
          version: AlgorithmEngineVersion.V3,
        });
        sinon
          .stub(certificationSharedUsecases, 'getCertificationCourse')
          .withArgs({ certificationCourseId: request.params.certificationCourseId })
          .resolves(certificationCourse);

        const v3CertificationAttestation = domainBuilder.certification.results.buildCertificate();
        sinon
          .stub(usecases, 'getCertificate')
          .withArgs({ certificationCourseId: request.params.certificationCourseId, locale: 'fr' })
          .resolves(v3CertificationAttestation);

        const generatedPdf = Symbol('Stream');
        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.getPDFCertificate(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3CertificationAttestation],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=certification-pix-${dayjs(v3CertificationAttestation.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when the attestation is for v2', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { certificationCourseId: 9 },
          query: { isFrenchDomainExtension: true, lang: 'fr' },
        };

        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: request.params.certificationCourseId,
          userId,
          version: AlgorithmEngineVersion.V2,
        });
        sinon
          .stub(certificationSharedUsecases, 'getCertificationCourse')
          .withArgs({ certificationCourseId: request.params.certificationCourseId })
          .resolves(certificationCourse);

        const certificationAttestation = domainBuilder.buildCertificationAttestation();
        const filename = 'certification-pix-20181003.pdf';

        sinon
          .stub(usecases, 'getCertificate')
          .withArgs({ certificationCourseId: request.params.certificationCourseId, locale: 'fr' })
          .resolves(certificationAttestation);

        const generatedPdf = Symbol('Stream');
        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.getPDFCertificate(request, hFake, {
          v2CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [certificationAttestation],
          i18n,
          isFrenchDomainExtension: true,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(`attachment; filename=${filename}`);
      });
    });
  });

  describe('#getSessionCertificates', function () {
    describe('when attestations are for a v3 session', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const v3CertificationAttestation = domainBuilder.certification.results.buildCertificate();
        const session = domainBuilder.certification.sessionManagement.buildSession.finalized({ id: 12 });
        const generatedPdf = Symbol('Stream');

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { sessionId: session.id },
          query: { isFrenchDomainExtension: true },
        };

        sinon
          .stub(usecases, 'getCertificatesForSession')
          .withArgs({
            sessionId: session.id,
          })
          .resolves([v3CertificationAttestation, v3CertificationAttestation]);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.getSessionCertificates(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3CertificationAttestation, v3CertificationAttestation],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=session-${session.id}-certification-pix-${dayjs(v3CertificationAttestation.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when attestations are for a v2 session', function () {
      it('should return an attestation in PDF binary format', async function () {
        // given
        const session = domainBuilder.certification.sessionManagement.buildSession.finalized({ id: 12 });
        domainBuilder.buildCertificationCourse({
          id: 1,
          sessionId: 12,
          userId: 1,
          completedAt: '2020-01-01',
        });
        domainBuilder.buildCertificationCourse({
          id: 2,
          sessionId: 12,
          userId: 2,
          completedAt: '2020-01-01',
        });
        domainBuilder.buildCertificationCourse({
          id: 3,
          sessionId: 12,
          userId: 3,
          completedAt: '2020-01-01',
        });
        const certification1 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 1 });
        const certification2 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 2 });
        const certification3 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 3 });
        const userId = 1;
        const i18n = getI18n();
        const generatedPdf = Symbol('Stream');

        const request = {
          auth: { credentials: { userId } },
          params: { sessionId: session.id },
          query: { isFrenchDomainExtension: true },
          i18n,
        };

        sinon
          .stub(usecases, 'getCertificatesForSession')
          .withArgs({
            sessionId: session.id,
          })
          .resolves([certification1, certification2, certification3]);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.getSessionCertificates(request, hFake, {
          v2CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [certification1, certification2, certification3],
          i18n,
          isFrenchDomainExtension: true,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=session-${session.id}-certification-pix-${dayjs(certification1.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });
  });

  describe('#downloadDivisionCertificates', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    describe('when there are at least one v3 attestation', function () {
      it('should return only v3 division attestations in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const v3Certificate = domainBuilder.certification.results.buildCertificate();
        const v2Certificate = domainBuilder.buildCertificationAttestation({
          version: AlgorithmEngineVersion.V2,
        });
        const generatedPdf = Symbol('Stream');

        const organizationId = domainBuilder.buildOrganization().id;
        const division = '3ème b';

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { organizationId },
          query: { division, isFrenchDomainExtension: true, lang: 'fr' },
        };

        sinon
          .stub(usecases, 'findCertificatesForDivision')
          .withArgs({
            division,
            organizationId,
            locale: 'fr',
          })
          .resolves([v3Certificate, v3Certificate, v2Certificate]);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.downloadDivisionCertificates(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3Certificate, v3Certificate],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=3eme-b-certification-pix-${dayjs(v3Certificate.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when attestations are for v2', function () {
      it('should return binary attestations', async function () {
        // given
        const certificates = [
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
        ];
        const generatedPdf = Symbol('Stream');
        const organizationId = domainBuilder.buildOrganization().id;
        const division = '3b';
        const userId = 1;
        const lang = 'fr';
        const i18n = getI18n();

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { organizationId },
          query: { division, isFrenchDomainExtension: true, lang },
        };

        sinon
          .stub(usecases, 'findCertificatesForDivision')
          .withArgs({
            division,
            organizationId,
            locale: 'fr',
          })
          .resolves(certificates);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificateController.downloadDivisionCertificates(request, hFake, {
          v2CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates,
          i18n,
          isFrenchDomainExtension: true,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          'attachment; filename=20190101_attestations_3b.pdf',
        );
      });
    });
  });
});
