import sinon from 'sinon';

import { sessionController } from '../../../../../src/certification/enrolment/application/session-controller.js';
import { SessionEnrolment } from '../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

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
    it('should return the updated session', async function () {
      // given
      const request = {
        auth: { credentials: { userId: 1 } },
        params: { sessionId: 345 },
        payload: {
          data: {
            attributes: {
              address: '1 rue des lauriers',
              room: '2B',
              date: '2021-01-01',
              time: '14:00',
              examiner: 'Louise',
              description: 'coucou',
            },
          },
        },
      };
      sinon.stub(usecases, 'updateSession');
      const sessionSerializer = { serialize: sinon.stub() };
      const sessionRepository = { get: sinon.stub() };
      usecases.updateSession
        .withArgs({
          address: '1 rue des lauriers',
          room: '2B',
          date: '2021-01-01',
          time: '14:00',
          examiner: 'Louise',
          description: 'coucou',
          sessionId: 345,
        })
        .resolves();
      const updatedSession = Symbol('updatedSession');
      sessionRepository.get.withArgs({ id: 345 }).resolves(updatedSession);
      sessionSerializer.serialize.withArgs(updatedSession).returns('json');

      // when
      const response = await sessionController.update(request, hFake, { sessionSerializer, sessionRepository });

      // then
      expect(response).to.equal('json');
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
    it('should return the session', async function () {
      // given
      const request = {
        auth: { credentials: { userId: 1 } },
        params: { sessionId: 345 },
      };
      const sessionSerializer = { serialize: sinon.stub() };
      const sessionRepository = { get: sinon.stub() };
      const session = Symbol('session');
      sessionRepository.get.withArgs({ id: 345 }).resolves(session);
      sessionSerializer.serialize.withArgs(session).returns('json');

      // when
      const response = await sessionController.get(request, hFake, { sessionSerializer, sessionRepository });

      // then
      expect(response).to.equal('json');
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
        headers: { origin: 'https://app.pix.fr' },
      };
      const candidate = {
        firstName,
        lastName,
        birthdate,
        sessionId,
        hasSeenCertificationInstructions: false,
      };

      sinon.stub(usecases, 'registerCandidateParticipation').resolves();
      usecases.registerCandidateParticipation
        .withArgs({
          userId,
          sessionId,
          firstName,
          lastName,
          birthdate,
          isFrenchDomainExtension: true,
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
