import { Session } from '../../../../../lib/domain/models/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { sessionController } from '../../../../../src/certification/session/application/session-controller.js';
import * as events from '../../../../../lib/domain/events/index.js';

describe('Unit | Controller | session-controller', function () {
  describe('#createSession', function () {
    let request;
    let expectedSession;
    let sessionSerializerStub;
    const userId = 274939274;

    beforeEach(function () {
      expectedSession = new Session({
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
      const savedSession = new Session({
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
      expect(sessionSerializerStub.serialize).to.have.been.calledWithExactly({ session: savedSession });
    });
  });

  describe('#update', function () {
    let request, updatedSession, updateSessionArgs;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
        payload: {},
      };

      updatedSession = {
        id: request.params.id,
      };

      updateSessionArgs = {
        userId: request.auth.credentials.userId,
        session: updatedSession,
      };

      sinon.stub(usecases, 'updateSession');
    });

    it('should return the updated session', async function () {
      // given
      const sessionSerializer = { serialize: sinon.stub(), deserialize: sinon.stub() };
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
      usecases.updateSession.withArgs(updateSessionArgs).resolves(updatedSession);
      sessionSerializer.serialize.withArgs({ session: updatedSession }).returns(updatedSession);

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
        params: { id: sessionId },
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

  describe('#finalize', function () {
    it('should call the finalizeSession usecase with correct values', async function () {
      // given
      const sessionId = 1;
      const aCertificationReport = Symbol('a certficication report');
      const updatedSession = Symbol('updatedSession');
      const examinerGlobalComment = 'It was a fine session my dear';
      const hasIncident = true;
      const hasJoiningIssue = true;
      const certificationReports = [
        {
          type: 'certification-reports',
        },
      ];
      const request = {
        params: {
          id: sessionId,
        },
        payload: {
          data: {
            attributes: {
              'examiner-global-comment': examinerGlobalComment,
              'has-incident': hasIncident,
              'has-joining-issue': hasJoiningIssue,
            },
            included: certificationReports,
          },
        },
      };
      const certificationReportSerializer = { deserialize: sinon.stub() };
      certificationReportSerializer.deserialize.resolves(aCertificationReport);
      sinon.stub(usecases, 'finalizeSession').resolves(updatedSession);

      // when
      await sessionController.finalize(request, hFake, { certificationReportSerializer, events });

      // then
      expect(usecases.finalizeSession).to.have.been.calledWithExactly({
        sessionId,
        examinerGlobalComment,
        hasIncident,
        hasJoiningIssue,
        certificationReports: [aCertificationReport],
      });
    });
  });
});
