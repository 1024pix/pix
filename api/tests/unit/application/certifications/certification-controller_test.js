import { expect, sinon, domainBuilder, hFake } from '../../../test-helper';
import certificationController from '../../../../lib/application/certifications/certification-controller';
import usecases from '../../../../lib/domain/usecases';
import certificationAttestationPdf from '../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf';
import events from '../../../../lib/domain/events';
import ChallengeNeutralized from '../../../../lib/domain/events/ChallengeNeutralized';
import ChallengeDeneutralized from '../../../../lib/domain/events/ChallengeDeneutralized';
import requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils';

describe('Unit | Controller | certifications-controller', function () {
  describe('#findUserCertifications', function () {
    it('should return the serialized private certificates of the user', async function () {
      // given
      const userId = 1;
      const request = { auth: { credentials: { userId } } };
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

  describe('#getCertification', function () {
    it('should return a serialized private certificate given by id', async function () {
      // given
      const userId = 1;
      const certificationId = 2;
      const request = {
        auth: { credentials: { userId } },
        params: { id: certificationId },
      };
      const locale = 'fr-fr';
      sinon.stub(requestResponseUtils, 'extractLocaleFromRequest');

      const privateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationId,
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
      });
      sinon.stub(usecases, 'getPrivateCertificate');
      usecases.getPrivateCertificate.withArgs({ userId, certificationId, locale }).resolves(privateCertificate);
      requestResponseUtils.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertification(request, hFake);

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

  describe('#getCertificationByVerificationCode', function () {
    it('should return a serialized shareable certificate given by verification code', async function () {
      // given
      const request = { payload: { verificationCode: 'P-123456BB' } };
      const locale = 'fr-fr';
      sinon.stub(requestResponseUtils, 'extractLocaleFromRequest');
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
      });
      sinon.stub(usecases, 'getShareableCertificate');
      usecases.getShareableCertificate
        .withArgs({ verificationCode: 'P-123456BB', locale })
        .resolves(shareableCertificate);
      requestResponseUtils.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertificationByVerificationCode(request, hFake);

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

  describe('#getCertificationAttestation', function () {
    it('should return attestation in PDF binary format', async function () {
      // given
      const certification = domainBuilder.buildPrivateCertificateWithCompetenceTree();
      const attestationPDF = 'binary string';
      const fileName = 'attestation-pix-20181003.pdf';
      const userId = 1;

      const request = {
        auth: { credentials: { userId } },
        params: { id: certification.id },
        query: { isFrenchDomainExtension: true },
      };

      sinon
        .stub(usecases, 'getCertificationAttestation')
        .withArgs({
          userId,
          certificationId: certification.id,
        })
        .resolves(certification);

      sinon
        .stub(certificationAttestationPdf, 'getCertificationAttestationsPdfBuffer')
        .withArgs({ certificates: [certification], isFrenchDomainExtension: true })
        .resolves({ buffer: attestationPDF, fileName });

      // when
      const response = await certificationController.getPDFAttestation(request, hFake);

      // then
      expect(response.source).to.deep.equal(attestationPDF);
      expect(response.headers['Content-Disposition']).to.contains('attachment; filename=attestation-pix-20181003.pdf');
    });
  });

  describe('#neutralizeChallenge', function () {
    it('neutralizes the challenge and dispatches the event', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon.stub(usecases, 'neutralizeChallenge');
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      await certificationController.neutralizeChallenge(request, hFake);

      // then
      expect(usecases.neutralizeChallenge).to.have.been.calledWith({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      });
    });

    it('returns 204', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon.stub(usecases, 'neutralizeChallenge');
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      const response = await certificationController.neutralizeChallenge(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('dispatches an event', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      const eventToBeDispatched = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
      sinon.stub(usecases, 'neutralizeChallenge').resolves(eventToBeDispatched);
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      await certificationController.neutralizeChallenge(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(eventToBeDispatched);
    });
  });

  describe('#deneutralizeChallenge', function () {
    it('deneutralizes the challenge', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon.stub(usecases, 'deneutralizeChallenge');
      sinon.stub(events, 'eventDispatcher');

      // when
      await certificationController.deneutralizeChallenge(request, hFake);

      // then
      expect(usecases.deneutralizeChallenge).to.have.been.calledWith({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      });
    });

    it('returns 204', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon.stub(usecases, 'deneutralizeChallenge');
      sinon.stub(events, 'eventDispatcher');

      // when
      const response = await certificationController.deneutralizeChallenge(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('dispatches the event', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      const eventToBeDispatched = new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 });

      sinon.stub(usecases, 'deneutralizeChallenge').resolves(eventToBeDispatched);
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      await certificationController.deneutralizeChallenge(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(eventToBeDispatched);
    });
  });
});
