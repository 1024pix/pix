import { services } from '../../../../../src/certification/enrolment/application/services/index.js';
import { sessionController } from '../../../../../src/certification/enrolment/application/session-controller.js';
import { SessionEnrolment } from '../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Controller | session-controller', function () {
  describe('#createSession', function () {
    let request;
    let expectedSession;
    let sessionSerializerStub;
    const userId = 274939274;

    beforeEach(function () {
      expectedSession = new SessionEnrolment({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12',
      });

      sinon.stub(usecases, 'createSession').resolves();
      sessionSerializerStub = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      sessionSerializerStub.deserialize.returns(expectedSession);

      request = {
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '2017-12-08',
              time: '14:30',
              description: 'ahah',
            },
          },
        },
        auth: {
          credentials: {
            userId,
          },
        },
      };
    });

    it('should create a session', async function () {
      // when
      await sessionController.createSession(request, hFake, { sessionSerializer: sessionSerializerStub });

      // then
      expect(usecases.createSession).to.have.been.calledWithExactly({ userId, session: expectedSession });
    });

    it('should return the created session in JSON API', async function () {
      // given
      const jsonApiSession = {
        data: {
          type: 'sessions',
          id: 12,
          attributes: {},
        },
      };
      const savedSession = new SessionEnrolment({
        id: '12',
        certificationCenter: 'Université de dressage de loutres',
      });

      usecases.createSession.resolves(savedSession);
      sessionSerializerStub.serialize.returns(jsonApiSession);

      // when
      const response = await sessionController.createSession(request, hFake, {
        sessionSerializer: sessionSerializerStub,
      });

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializerStub.serialize).to.have.been.calledWithExactly(savedSession);
    });
  });

  describe('#update', function () {
    let request, updatedSession;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { sessionId: 345 },
        payload: {},
      };

      updatedSession = {
        id: request.params.sessionId,
      };

      sinon.stub(usecases, 'updateSession');
    });

    it('should return the updated session', async function () {
      // given
      const sessionSerializer = { serialize: sinon.stub(), deserialize: sinon.stub() };
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
      usecases.updateSession
        .withArgs({ userId: request.auth.credentials.userId, session: updatedSession })
        .resolves(updatedSession);
      sessionSerializer.serialize.withArgs(updatedSession).returns(updatedSession);

      // when
      const response = await sessionController.update(request, hFake, { sessionSerializer });

      // then
      expect(response).to.deep.equal(updatedSession);
    });
  });

  describe('#delete', function () {
    it('should delete the session', async function () {
      // given
      const sessionId = 1;
      const userId = 1;
      sinon.stub(usecases, 'deleteSession');
      const request = {
        params: { sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };

      // when
      await sessionController.remove(request, hFake);

      // then
      expect(usecases.deleteSession).to.have.been.calledWithExactly({
        sessionId,
      });
    });
  });

  describe('#get', function () {
    const sessionId = 123;
    let request;
    const userId = 274939274;

    beforeEach(function () {
      sinon.stub(usecases, 'getSession');

      request = {
        auth: { credentials: { userId } },
        params: {
          sessionId,
        },
      };
    });

    context('when session exists', function () {
      it('should reply serialized session informations', async function () {
        // given
        const sessionSerializer = { serialize: sinon.stub() };
        const foundSession = Symbol('foundSession');
        const serializedSession = Symbol('serializedSession');
        usecases.getSession.withArgs({ sessionId }).resolves({ session: foundSession });
        sessionSerializer.serialize.withArgs({ session: foundSession }).returns(serializedSession);

        // when
        const response = await sessionController.get(request, hFake, {
          sessionSerializer,
        });

        // then
        expect(response).to.deep.equal(serializedSession);
      });
    });
  });

  describe('#createCandidateParticipation', function () {
    it('should return candidate information', async function () {
      // given
      const sessionId = 123;
      const userId = 274939274;
      const firstName = 'Jeanne';
      const lastName = 'Serge';
      const birthdate = '2020-10-10';

      const request = {
        payload: {
          data: {
            attributes: {
              'first-name': firstName,
              'last-name': lastName,
              birthdate,
            },
          },
        },
        auth: { credentials: { userId } },
        params: { sessionId },
      };
      const candidate = {
        firstName,
        lastName,
        birthdate,
        sessionId,
        hasSeenCertificationInstructions: false,
      };

      sinon.stub(services, 'registerCandidateParticipation');
      services.registerCandidateParticipation
        .withArgs({
          userId,
          sessionId,
          firstName,
          lastName,
          birthdate,
          normalizeStringFnc: normalize,
        })
        .resolves(candidate);

      // when
      const response = await sessionController.createCandidateParticipation(request, hFake);

      // then
      expect(response.source).to.deep.equal({
        data: {
          attributes: {
            birthdate,
            'first-name': firstName,
            'has-seen-certification-instructions': false,
            'last-name': lastName,
            'session-id': sessionId,
          },
          type: 'certification-candidates',
        },
      });
    });
  });
});
