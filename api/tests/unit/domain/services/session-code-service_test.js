const { expect } = require('../../../test-helper');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');

describe('Unit | Service | CodeSession', function () {
  describe('#getNewSessionCode', function () {
    it('should return a non ambiguous session code with 4 random capital letters and 2 random numbers', async function () {
      // when
      const result = await sessionCodeService.getNewSessionCode();

      // then
      expect(result).to.match(/[B,C,D,F,G,H,J,K,M,P,Q,R,T,V,W,X,Y]{4}[2,3,4,6,7,8,9]{2}/);
    });
  });
});
