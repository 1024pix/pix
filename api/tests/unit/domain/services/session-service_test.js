const { expect, sinon } = require('../../../test-helper');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | Service | session', () => {

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
