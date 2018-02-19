const { expect, sinon } = require('../../../test-helper');
const AccessSession = require('../../../../lib/application/preHandlers/access-session');
const SessionService = require('../../../../lib/domain/services/session-service');

describe('Unit | Pre-handler | Session Access', () => {

  describe('#sessionIsOpened', () => {

    let reply;
    let takeover;
    let code;

    beforeEach(() => {
      takeover = sinon.stub();
      code = sinon.stub().returns({ takeover });
      reply = sinon.stub().returns({ code });
      sinon.stub(SessionService, 'getCurrentCode').returns('e24d32');
    });

    afterEach(() => {
      SessionService.getCurrentCode.restore();
    });

    it('should be a function', () => {
      // then
      expect(AccessSession.sessionIsOpened).to.be.a('function');
    });

    context('when session-code is not given', () => {
      it('should stop the request', () => {
        // given
        const request = { payload: { data: { attributes: {} } } };

        // when
        AccessSession.sessionIsOpened(request, reply);

        // then
        expect(reply).to.have.been.called;
        expect(code).to.have.been.called;
        expect(takeover).to.have.been.called;
      });
    });

    context('when session-code is wrong', () => {
      it('should stop the request', () => {
        // given
        const request = { payload: { data: { attributes: { id: '1245', 'session-code': 'WrongCode' } } } };

        // when
        AccessSession.sessionIsOpened(request, reply);

        // then
        expect(reply).to.have.been.called;
        expect(takeover).to.have.been.called;
      });
    });

    context('when session-code is correct', () => {
      it('should let the request continue', () => {
        // given
        const request = { payload: { data: { attributes: { id: '1245', 'session-code': 'e24d32' } } } };
        const requestWithoutSessionCode = {
          payload: {
            data: {
              attributes: {
                id: '1245'
              }
            }
          }
        };

        // when
        AccessSession.sessionIsOpened(request, reply);

        // then
        expect(reply).to.have.been.calledWith(requestWithoutSessionCode);
        expect(takeover).not.to.have.been.called;
      });
    });
  });
});
