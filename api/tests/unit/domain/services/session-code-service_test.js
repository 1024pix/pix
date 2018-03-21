const { expect, sinon } = require('../../../test-helper');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | Service | CodeSession', () => {

  describe('#isSessionCodeAvailable', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a session code with 4 random capital letters and 2 random numbers', () => {
      // given
      sandbox.stub(sessionRepository, 'isSessionCodeAvailable').resolves(true);

      // when
      const promise = sessionCodeService.getNewSessionCode();

      // then
      return promise.then((result) => {
        expect(result).to.match(/[A-Z]{4}[0-9]{2}/);
      });
    });

    it('should call Repository isSessionCodeAvailable to validate code unicity', () => {
      // given
      sandbox.stub(sessionRepository, 'isSessionCodeAvailable').resolves(true);

      // when
      const promise = sessionCodeService.getNewSessionCode();

      // then
      return promise.then((result) => {
        sinon.assert.calledOnce(sessionRepository.isSessionCodeAvailable);
        sinon.assert.calledWith(sessionRepository.isSessionCodeAvailable, result);
      });
    });

    it('should call Repository isSessionCodeAvailable twice if first code was not unique', () => {
      // given
      sandbox.stub(sessionRepository, 'isSessionCodeAvailable')
        .onCall(0).resolves(false)
        .onCall(1).resolves(true);

      // when
      const promise = sessionCodeService.getNewSessionCode();

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(sessionRepository.isSessionCodeAvailable);
      });
    });
  });

  describe('#getSessionByAccessCode', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if session exists with this accessCode', () => {
      // given
      sandbox.stub(sessionRepository, 'getByAccessCode').resolves({ id: 1 });

      // when
      const promise = sessionCodeService.getSessionByAccessCode('ABCD12');

      // then
      return promise.then((result) => {
        expect(result).to.be.deep.equal({ id: 1 });
      });
    });

    it('should return false if accessCode does not link to a session', () => {
      // given
      sandbox.stub(sessionRepository, 'getByAccessCode').resolves(null);

      // when
      const promise = sessionCodeService.getSessionByAccessCode('BBAAAHHHHH');

      // then
      return promise.then((result) => {
        expect(result).to.be.equal(null);
      });
    });
  });

});
