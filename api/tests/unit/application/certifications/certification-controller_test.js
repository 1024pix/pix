const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const certificationController = require('../../../../lib/application/certifications/certification-controller');
const usecases = require('../../../../lib/domain/usecases');
const certificationAttestationPdf = require('../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
const events = require('../../../../lib/domain/events');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const ChallengeDeneutralized = require('../../../../lib/domain/events/ChallengeDeneutralized');

describe('Unit | Controller | certifications-controller', () => {

  describe('#findUserCertifications', () => {

    it('should return a serialized private certificates array found in the usecase', async () => {
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
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
            'id': '123',
            'type': 'certifications',
            'attributes': {
              'first-name': 'Dorothé',
              'last-name': '2Pac',
              'birthdate': '2000-01-01',
              'birthplace': 'Sin City',
              'certification-center': 'Centre des choux de Bruxelles',
              'date': new Date('2020-01-01T00:00:00Z'),
              'delivered-at': new Date('2021-01-01T00:00:00Z'),
              'is-published': true,
              'pix-score': 456,
              'status': 'validated',
              'comment-for-candidate': 'Cette personne est impolie !',
              'clea-certification-status': 'acquired',
              'certified-badge-images': [],
              'verification-code': 'P-SUPERCODE',
              'max-reachable-level-on-certification-date': 6,
            },
            'relationships': {
              'result-competence-tree': {
                'data': null,
              },
            },
          },
        ],
      });
    });
  });

  describe('#getCertification', () => {

    it('should return a serialized private certificate found in the usecase', async () => {
      // given
      const userId = 1;
      const certificationId = 2;
      const request = {
        auth: { credentials: { userId } },
        params: { id: certificationId },
      };
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
        certifiedBadgeImages: [],
        verificationCode: 'P-SUPERCODE',
        maxReachableLevelOnCertificationDate: 6,
      });
      sinon.stub(usecases, 'getPrivateCertificate');
      usecases.getPrivateCertificate.withArgs({ userId, certificationId }).resolves(privateCertificate);

      // when
      const response = await certificationController.getCertification(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: {
          'id': '2',
          'type': 'certifications',
          'attributes': {
            'first-name': 'Dorothé',
            'last-name': '2Pac',
            'birthdate': '2000-01-01',
            'birthplace': 'Sin City',
            'certification-center': 'Centre des choux de Bruxelles',
            'date': new Date('2020-01-01T00:00:00Z'),
            'delivered-at': new Date('2021-01-01T00:00:00Z'),
            'is-published': true,
            'pix-score': 456,
            'status': 'validated',
            'comment-for-candidate': 'Cette personne est impolie !',
            'clea-certification-status': 'acquired',
            'certified-badge-images': [],
            'verification-code': 'P-SUPERCODE',
            'max-reachable-level-on-certification-date': 6,
          },
          'relationships': {
            'result-competence-tree': {
              'data': null,
            },
          },
        },
      });
    });
  });

  describe('#getCertificationByVerificationCode', () => {

    it('should return a serialized shareable certificate found in the usecase', async () => {
      // given
      const request = { payload: { verificationCode: 'P-123456BB' } };
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
        certifiedBadgeImages: ['/img/1'],
        maxReachableLevelOnCertificationDate: 6,
      });
      sinon.stub(usecases, 'getShareableCertificate');
      usecases.getShareableCertificate.withArgs({ verificationCode: 'P-123456BB' }).resolves(shareableCertificate);

      // when
      const response = await certificationController.getCertificationByVerificationCode(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: {
          'id': '123',
          'type': 'certifications',
          'attributes': {
            'first-name': 'Dorothé',
            'last-name': '2Pac',
            'birthdate': '2000-01-01',
            'birthplace': 'Sin City',
            'certification-center': 'Centre des choux de Bruxelles',
            'date': new Date('2020-01-01T00:00:00Z'),
            'delivered-at': new Date('2021-01-01T00:00:00Z'),
            'is-published': true,
            'pix-score': 456,
            'status': 'validated',
            'clea-certification-status': 'acquired',
            'certified-badge-images': [
              '/img/1',
            ],
            'max-reachable-level-on-certification-date': 6,
          },
          'relationships': {
            'result-competence-tree': {
              'data': null,
            },
          },
        },
      });
    });
  });

  describe('#getCertificationAttestation', () => {

    const certification = domainBuilder.buildPrivateCertificateWithCompetenceTree();
    const attestationPDF = 'binary string';
    const fileName = 'attestation-pix-20181003.pdf';
    const userId = 1;

    const request = {
      auth: { credentials: { userId } },
      params: { id: certification.id },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getCertificationAttestation');
    });

    it('should return binary attestation', async () => {
      // given
      sinon.stub(certificationAttestationPdf, 'getCertificationAttestationPdfBuffer').resolves({ file: attestationPDF, fileName });
      usecases.getCertificationAttestation.resolves(certification);

      // when
      const response = await certificationController.getPDFAttestation(request, hFake);

      // then
      expect(usecases.getCertificationAttestation).to.have.been.calledWith({
        userId,
        certificationId: certification.id,
      });
      expect(response.source).to.deep.equal(attestationPDF);
      expect(response.headers['Content-Disposition']).to.contains('attachment; filename=attestation-pix-20181003.pdf');
    });
  });

  describe('#neutralizeChallenge', () => {
    it('neutralizes the challenge and dispatches the event', async () => {
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

    it('returns 204', async () => {
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

    it('dispatches an event', async () => {
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

  describe('#deneutralizeChallenge', () => {
    it('deneutralizes the challenge', async () => {
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

    it('returns 204', async () => {
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

    it('dispatches the event', async () => {
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
