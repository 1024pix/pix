import { Session } from '../../../../../lib/domain/models/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { createSessionController } from '../../../../../src/certification/session/application/create-session-controller.js';

describe('Unit | Controller | create-session-controller', function () {
  describe('#saveSession', function () {
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

    it('should save the session', async function () {
      // when
      await createSessionController.createSession(request, hFake, { sessionSerializer: sessionSerializerStub });

      // then
      expect(usecases.createSession).to.have.been.calledWithExactly({ userId, session: expectedSession });
    });

    it('should return the saved session in JSON API', async function () {
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
      const response = await createSessionController.createSession(request, hFake, {
        sessionSerializer: sessionSerializerStub,
      });

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializerStub.serialize).to.have.been.calledWithExactly({ session: savedSession });
    });
  });
});
