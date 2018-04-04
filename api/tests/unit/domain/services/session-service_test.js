const { expect, sinon } = require('../../../test-helper');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const { NotFoundError } = require('../../../../lib/domain/errors');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | Service | session', () => {

  describe('#sessionExists', () => {

    beforeEach(() => {
      sinon.stub(sessionCodeService, 'getSessionByAccessCode');
    });

    afterEach(() => {
      sessionCodeService.getSessionByAccessCode.restore();
    });

    context('when access-code is not given', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists(null);

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is wrong', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists('1234');

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is correct', () => {
      it('should let the request continue', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves({ id: 12 });

        // when
        const promise = sessionService.sessionExists('ABCD12');

        // then
        return promise.then((result) => {
          expect(result).to.be.equal(12);
        });
      });
    });
  });

  describe('#get', () => {

    it('should get session informations with related certifications', () => {
      // given
      const sessionId = 'grève SNCF';
      sinon.stub(sessionRepository, 'get').resolves();

      // when
      const promise = sessionService.get(sessionId);

      // then
      promise.then(() => {
        expect(sessionRepository.get).to.have.been.calledWith('grève SNCF');
      });
    });
  });
});
