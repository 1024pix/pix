const { expect, sinon } = require('../../../test-helper');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const { NotFoundError } = require('../../../../lib/domain/errors');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | Service | session', () => {

  describe('#getSessionIdByAccessCode', () => {

    beforeEach(() => {
      sinon.stub(sessionCodeService, 'getSessionByAccessCode');
    });

    context('when access-code is not given', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.getSessionIdByAccessCode(null);

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
        const promise = sessionService.getSessionIdByAccessCode('1234');

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
        const promise = sessionService.getSessionIdByAccessCode('ABCD12');

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
      const sessionId = 'sessionId';
      sinon.stub(sessionRepository, 'get').resolves();

      // when
      const promise = sessionService.get(sessionId);

      // then
      return promise.then(() => {
        expect(sessionRepository.get).to.have.been.calledWith('sessionId');
      });
    });
  });

});
