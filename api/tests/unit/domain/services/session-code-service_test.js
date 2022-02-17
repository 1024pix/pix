const { expect, sinon } = require('../../../test-helper');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/sessions/session-repository');
const _ = require('lodash');

describe('Unit | Service | CodeSession', function () {
  describe('#isSessionCodeAvailable', function () {
    it('should return a non ambiguous session code with 4 random capital letters and 2 random numbers', async function () {
      // given
      sinon.stub(sessionRepository, 'isSessionCodeAvailable').resolves(true);

      // when
      const result = await sessionCodeService.getNewSessionCode();

      // then
      expect(result).to.match(/[B,C,D,F,G,H,J,K,M,P,Q,R,T,V,W,X,Y]{4}[2,3,4,6,7,8,9]{2}/);
    });

    it('should return a new code if first code was not unique', async function () {
      // given
      sinon.stub(sessionRepository, 'isSessionCodeAvailable').onCall(0).resolves(false).onCall(1).resolves(true);
      sinon
        .stub(_, 'sample')
        .returns('A')
        .onCall(6)
        .returns('B')
        .onCall(7)
        .returns('B')
        .onCall(8)
        .returns('B')
        .onCall(9)
        .returns('B')
        .onCall(10)
        .returns('2')
        .onCall(11)
        .returns('2');

      // when
      const result = await sessionCodeService.getNewSessionCode();

      // then
      expect(result).to.equal('BBBB22');
    });
  });
});
