const { expect, sinon, hFake } = require('../../../test-helper');

const sessionController = require('../../../../lib/application/sessions/session-controller');

const usecases = require('../../../../lib/domain/usecases');
const Session = require('../../../../lib/domain/models/Session');
const sessionService = require('../../../../lib/domain/services/session-service');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const certificationCandidateSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');

describe('Unit | Controller | sessionController', () => {

  let request;
  let expectedSession;
  const userId = 274939274;

  describe('#create', () => {

    beforeEach(() => {
      expectedSession = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12'
      });

      sinon.stub(usecases, 'createSession').resolves();
      sinon.stub(sessionSerializer, 'deserialize').returns(expectedSession);
      sinon.stub(sessionSerializer, 'serialize');

      request = {
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '08/12/2017',
              time: '14:30',
              description: 'ahah'
            }
          }
        },
        auth: {
          credentials: {
            userId,
          }
        }
      };
    });

    it('should save the session', async () => {
      // when
      await sessionController.save(request, hFake);

      // then
      expect(usecases.createSession).to.have.been.calledWith({ userId, session: expectedSession });
    });

    it('should return the saved session in JSON API', async () => {
      // given
      const jsonApiSession = {
        data: {
          type: 'sessions',
          id: 12,
          attributes: {}
        }
      };
      const savedSession = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres'
      });

      usecases.createSession.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // when
      const response = await sessionController.save(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
    });
  });

  describe('#get', function() {

    beforeEach(() => {
      sinon.stub(sessionService, 'get');
      sinon.stub(sessionSerializer, 'serialize');
      request = {
        params: {
          id: 'sessionId'
        }
      };
    });

    context('when session exists', () => {

      it('should get session informations with certifications associated', async function() {
        // given
        sessionService.get.resolves();

        // when
        await sessionController.get(request, hFake);

        // then
        expect(sessionService.get).to.have.been.calledWith('sessionId');
      });

      it('should serialize session informations', async function() {
        // given
        const certification = CertificationCourse.fromAttributes({ id: 'certifId', sessionId: 'sessionId' });
        const session = new Session({
          id: 'sessionId',
          certifications: [certification]
        });
        sessionService.get.resolves(session);

        // when
        await sessionController.get(request, hFake);

        // then
        expect(sessionSerializer.serialize).to.have.been.calledWith(session);
      });

      it('should reply serialized session informations', async function() {
        // given
        const serializedSession = {
          data: {
            type: 'sessions',
            id: 'id',
          }
        };
        sessionSerializer.serialize.resolves(serializedSession);
        sessionService.get.resolves();

        // when
        const response = await sessionController.get(request, hFake);

        // then
        expect(response).to.deep.equal(serializedSession);
      });

    });
  });

  describe('#update ', () => {
    let request, updatedSession, updateSessionArgs;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id : 1 },
        payload: {}
      };

      updatedSession = {
        id: request.params.id,
      };

      updateSessionArgs = {
        userId: request.auth.credentials.userId,
        session: updatedSession,
      };

      sinon.stub(usecases, 'updateSession');
      sinon.stub(sessionSerializer, 'deserialize');
      sinon.stub(sessionSerializer, 'serialize');
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
    });

    it('should returns the updated session', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).resolves(updatedSession);
      sessionSerializer.serialize.withArgs(updatedSession).returns(updatedSession);

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedSession);
    });
  });

  describe('#parseCertificationCandidatesFromAttendanceSheet', () => {

    const sessionId = 2;
    const userId = 1;
    let request, parsedCertificationCandidates, returnedCertificationCandidates;
    const fileBuffer = 'File Buffer';
    beforeEach(() => {
      // given
      request = {
        auth: { credentials: { userId } },
        params: { id : sessionId },
        payload: { file: fileBuffer }
      };

      parsedCertificationCandidates = [
        {
          name: 'salut',
        },
        {
          name: 'au revoir',
        },];

      returnedCertificationCandidates = [
        {
          attributes: {
            name: 'salut',
          }
        },
        {
          attributes: {
            name: 'au revoir',
          }
        },];
      sinon.stub(certificationCandidateSerializer, 'serialize').withArgs(parsedCertificationCandidates).returns(returnedCertificationCandidates);
      sinon.stub(usecases, 'parseCertificationCandidatesFromAttendanceSheet').resolves(parsedCertificationCandidates);
    });

    it('should parse certification candidates from file', async () => {
      // when
      await sessionController.parseCertificationCandidatesFromAttendanceSheet(request, hFake);

      // then
      expect(usecases.parseCertificationCandidatesFromAttendanceSheet).to.have.been.calledWith(
        {
          userId,
          sessionId,
          odsBuffer: fileBuffer,
        }
      );
    });

    it('should reply with serialized certification candidates', async () => {
      // when
      const response = await sessionController.parseCertificationCandidatesFromAttendanceSheet(request, hFake);

      // then
      expect(certificationCandidateSerializer.serialize).to.have.been.calledWith(parsedCertificationCandidates);
      expect(response).to.deep.equal(returnedCertificationCandidates);
    });

  });

});
