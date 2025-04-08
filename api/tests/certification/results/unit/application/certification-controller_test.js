import dayjs from 'dayjs';

import { certificationController } from '../../../../../src/certification/results/application/certification-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { SESSIONS_VERSIONS } from '../../../../../src/certification/shared/domain/models/SessionVersion.js';
import { LANGUAGES_CODE } from '../../../../../src/shared/domain/services/language-service.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

const { FRENCH } = LANGUAGES_CODE;

describe('Certification | Results | Unit | Application | certifications-controller', function () {
  describe('#getCertificationByVerificationCode', function () {
    it('should return a serialized shareable certificate given by verification code', async function () {
      // given
      const request = { payload: { verificationCode: 'P-123456BB' } };
      const locale = 'fr-fr';
      const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
      const shareableCertificate = domainBuilder.buildShareableCertificate({
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
        certifiedBadgeImages: ['/img/1'],
        maxReachableLevelOnCertificationDate: 6,
        version: SESSIONS_VERSIONS.V3,
      });
      sinon.stub(usecases, 'getShareableCertificate');
      usecases.getShareableCertificate
        .withArgs({ verificationCode: 'P-123456BB', locale })
        .resolves(shareableCertificate);
      requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertificationByVerificationCode(request, hFake, {
        requestResponseUtils: requestResponseUtilsStub,
      });

      // then
      expect(response).to.deep.equal({
        data: {
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
            'certified-badge-images': ['/img/1'],
            'max-reachable-level-on-certification-date': 6,
            version: SESSIONS_VERSIONS.V3,
          },
          relationships: {
            'result-competence-tree': {
              data: null,
            },
          },
        },
      });
    });
  });

  describe('#getCertification', function () {
    it('should return a serialized private certificate given by id', async function () {
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
      const privateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
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
        version: SESSIONS_VERSIONS.V3,
      });
      sinon.stub(usecases, 'getPrivateCertificate');
      usecases.getPrivateCertificate.withArgs({ userId, certificationCourseId, locale }).resolves(privateCertificate);
      requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertification(request, hFake, {
        requestResponseUtils: requestResponseUtilsStub,
      });

      // then
      expect(response).to.deep.equal({
        data: {
          id: '2',
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
            version: SESSIONS_VERSIONS.V3,
          },
          relationships: {
            'result-competence-tree': {
              data: null,
            },
          },
        },
      });
    });
  });

  describe('#findUserCertifications', function () {
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
        version: SESSIONS_VERSIONS.V3,
      });
      sinon.stub(usecases, 'findUserPrivateCertificates');
      usecases.findUserPrivateCertificates.withArgs({ userId }).resolves([privateCertificate1]);

      // when
      const response = await certificationController.findUserCertifications(request, hFake);

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
              version: SESSIONS_VERSIONS.V3,
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

  describe('#getPDFAttestation', function () {
    describe('when the attestation is for v3', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const v3CertificationAttestation = domainBuilder.certification.results.buildV3Certification();
        const userId = 1;
        const i18n = getI18n();
        const generatedPdf = Symbol('Stream');

        const request = {
          i18n,
          auth: { credentials: { userId: 1 } },
          params: { certificationCourseId: 1 },
          query: { lang: FRENCH },
        };

        sinon
          .stub(usecases, 'getCertificationAttestation')
          .withArgs({
            userId,
            certificationCourseId: request.params.certificationCourseId,
          })
          .resolves(v3CertificationAttestation);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificationController.getPDFAttestation(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3CertificationAttestation],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=attestation-pix-${dayjs(v3CertificationAttestation.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when the attestation is for v2', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const certificationAttestation = domainBuilder.buildCertificationAttestation();
        const certificatPDF = 'binary string';
        const filename = 'attestation-pix-20181003.pdf';
        const userId = 1;
        const i18n = Symbol('i18n');

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { certificationCourseId: 1 },
          query: { isFrenchDomainExtension: true, lang: FRENCH },
        };

        sinon
          .stub(usecases, 'getCertificationAttestation')
          .withArgs({
            userId,
            certificationCourseId: request.params.certificationCourseId,
          })
          .resolves(certificationAttestation);

        const certificationPdfStub = {
          getCertificationsPdfBuffer: sinon.stub(),
        };

        certificationPdfStub.getCertificationsPdfBuffer
          .withArgs({ certificates: [certificationAttestation], isFrenchDomainExtension: true, i18n })
          .resolves({ buffer: certificatPDF, fileName: filename });

        // when
        const response = await certificationController.getPDFAttestation(request, hFake, {
          certificationPdf: certificationPdfStub,
        });

        // then
        expect(response.source).to.deep.equal(certificatPDF);
        expect(response.headers['Content-Disposition']).to.contains(`attachment; filename=${filename}`);
      });
    });
  });

  describe('#getCertificationPDFAttestationsForSession', function () {
    describe('when attestations are for a v3 session', function () {
      it('should return attestation in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const v3CertificationAttestation = domainBuilder.certification.results.buildV3Certification();
        const session = domainBuilder.certification.sessionManagement.buildSession.finalized({ id: 12 });
        const generatedPdf = Symbol('Stream');

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { sessionId: session.id },
          query: { isFrenchDomainExtension: true },
        };

        sinon
          .stub(usecases, 'getCertificationAttestationsForSession')
          .withArgs({
            sessionId: session.id,
          })
          .resolves([v3CertificationAttestation, v3CertificationAttestation]);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificationController.getCertificationPDFAttestationsForSession(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3CertificationAttestation, v3CertificationAttestation],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=session-${session.id}-attestation-pix-${dayjs(v3CertificationAttestation.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when attestations are for a v2 session', function () {
      it('should return an attestation in PDF binary format', async function () {
        // given
        const certificationPdf = {
          getCertificationsPdfBuffer: sinon.stub(),
        };
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
        const certificatPDF = 'binary string';
        const userId = 1;
        const i18n = getI18n();

        const request = {
          auth: { credentials: { userId } },
          params: { sessionId: session.id },
          query: { isFrenchDomainExtension: true },
          i18n,
        };

        sinon
          .stub(usecases, 'getCertificationAttestationsForSession')
          .withArgs({
            sessionId: session.id,
          })
          .resolves([certification1, certification2, certification3]);

        certificationPdf.getCertificationsPdfBuffer
          .withArgs({
            certificates: [certification1, certification2, certification3],
            isFrenchDomainExtension: true,
            i18n,
          })
          .resolves({ buffer: certificatPDF });

        // when
        const response = await certificationController.getCertificationPDFAttestationsForSession(request, hFake, {
          certificationPdf,
        });

        // then
        expect(response.source).to.deep.equal(certificatPDF);
        expect(response.headers['Content-Disposition']).to.contains(
          'attachment; filename=attestation-pix-session-12.pdf',
        );
      });
    });
  });

  describe('#downloadCertificationAttestationsForDivision', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    describe('when attestations are for v3', function () {
      it('should return division attestations in PDF binary format', async function () {
        // given
        const userId = 1;
        const i18n = getI18n();

        const v3CertificationAttestation = domainBuilder.certification.results.buildV3Certification();
        const generatedPdf = Symbol('Stream');

        const organizationId = domainBuilder.buildOrganization().id;
        const division = '3ème b';

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { organizationId },
          query: { division, isFrenchDomainExtension: true, lang: FRENCH },
        };

        sinon
          .stub(usecases, 'findCertificationAttestationsForDivision')
          .withArgs({
            division,
            organizationId,
          })
          .resolves([v3CertificationAttestation, v3CertificationAttestation]);

        const generatePdfStub = {
          generate: sinon.stub().returns(generatedPdf),
        };

        // when
        const response = await certificationController.downloadCertificationAttestationsForDivision(request, hFake, {
          v3CertificationAttestationPdf: generatePdfStub,
        });

        // then
        expect(generatePdfStub.generate).calledOnceWithExactly({
          certificates: [v3CertificationAttestation, v3CertificationAttestation],
          i18n,
        });
        expect(response.source).to.deep.equal(generatedPdf);
        expect(response.headers['Content-Disposition']).to.contains(
          `attachment; filename=3eme-b-attestation-pix-${dayjs(v3CertificationAttestation.deliveredAt).format('YYYYMMDD')}.pdf`,
        );
      });
    });

    describe('when attestations are for v2', function () {
      it('should return binary attestations', async function () {
        // given
        const certifications = [
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
        ];
        const organizationId = domainBuilder.buildOrganization().id;
        const division = '3b';
        const certificatPDF = 'binary string';
        const userId = 1;
        const lang = FRENCH;
        const i18n = getI18n();

        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { organizationId },
          query: { division, isFrenchDomainExtension: true, lang },
        };

        sinon
          .stub(usecases, 'findCertificationAttestationsForDivision')
          .withArgs({
            division,
            organizationId,
          })
          .resolves(certifications);

        const certificationPdfStub = {
          getCertificationsPdfBuffer: sinon.stub(),
        };

        const dependencies = {
          certificationPdf: certificationPdfStub,
        };

        certificationPdfStub.getCertificationsPdfBuffer
          .withArgs({ certificates: certifications, isFrenchDomainExtension: true, i18n })
          .resolves({ buffer: certificatPDF });

        // when
        const response = await certificationController.downloadCertificationAttestationsForDivision(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.source).to.deep.equal(certificatPDF);
        expect(response.headers['Content-Disposition']).to.contains(
          'attachment; filename=20190101_attestations_3b.pdf',
        );
      });
    });
  });
});
