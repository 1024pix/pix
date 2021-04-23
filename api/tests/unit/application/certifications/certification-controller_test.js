const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const certificationController = require('../../../../lib/application/certifications/certification-controller');
const usecases = require('../../../../lib/domain/usecases');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const certificationAttestationPdf = require('../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
const events = require('../../../../lib/domain/events');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');

describe('Unit | Controller | certifications-controller', () => {

  describe('#findUserCertifications', () => {

    const retrievedCertifications = [];
    const serializedCertifications = [];
    const userId = 1;

    const request = { auth: { credentials: { userId } } };

    beforeEach(() => {
      sinon.stub(usecases, 'findCompletedUserCertifications');
      sinon.stub(certificationSerializer, 'serialize').returns(serializedCertifications);
    });

    it('should return a serialized certifications array when use case return a array of Certifications', async () => {
      // given
      usecases.findCompletedUserCertifications.resolves(retrievedCertifications);

      // when
      const response = await certificationController.findUserCertifications(request, hFake);

      // then
      expect(usecases.findCompletedUserCertifications).to.have.been.calledWith({ userId });
      expect(certificationSerializer.serialize).to.have.been.calledWith(retrievedCertifications);
      expect(response).to.deep.equal(serializedCertifications);
    });
  });

  describe('#getCertification', () => {

    const certification = domainBuilder.buildPrivateCertificateWithCompetenceTree();
    const serializedCertification = '{JSON}';
    const userId = 1;

    const request = {
      auth: { credentials: { userId } },
      params: { id: certification.id },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getPrivateCertificate');
      sinon.stub(certificationSerializer, 'serialize').returns(serializedCertification);
    });

    it('should return a serialized certification when use case returns a certification', async () => {
      // given
      usecases.getPrivateCertificate.resolves(certification);

      // when
      const response = await certificationController.getCertification(request, hFake);

      // then
      expect(usecases.getPrivateCertificate).to.have.been.calledWith({
        userId,
        certificationId: certification.id,
      });
      expect(certificationSerializer.serialize).to.have.been.calledWith(certification);
      expect(response).to.deep.equal(serializedCertification);
    });
  });

  describe('#getCertificationByVerificationCode', () => {
    const certification = domainBuilder.buildPrivateCertificateWithCompetenceTree();
    const serializedCertification = '{JSON}';

    const verificationCode = 'P-123456BB';
    const request = { payload: { verificationCode } };

    beforeEach(() => {
      sinon.stub(usecases, 'getShareableCertificate');
      sinon.stub(certificationSerializer, 'serializeForSharing');
    });

    it('should return a serialized certification when use case returns a certification', async () => {
      // given
      usecases.getShareableCertificate.withArgs({ verificationCode }).resolves(certification);
      certificationSerializer.serializeForSharing.withArgs(certification).returns(serializedCertification);

      // when
      const response = await certificationController.getCertificationByVerificationCode(request, hFake);

      // then
      expect(response).to.deep.equal(serializedCertification);
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
      const eventToBeDispatched = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
      sinon.stub(usecases, 'neutralizeChallenge').withArgs({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      }).resolves(eventToBeDispatched);
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      const response = await certificationController.neutralizeChallenge(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(eventToBeDispatched);
      expect(response.statusCode).to.equal(204);
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

      // when
      const response = await certificationController.deneutralizeChallenge(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

  });
});
