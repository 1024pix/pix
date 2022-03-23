const { expect } = require('../../../test-helper');
const NeoTokens = require('../../../../lib/domain/models/NeoTokens');

describe('Unit | Domain | Models | NeoTokens', function () {
  describe('#constructor', function () {
    it('should construct a model NeoTokens from attributes', function () {
      // given
      const attributes = {
        accessToken: 'accessToken',
        expiresIn: 60,
        refreshToken: 'refreshToken',
        scope: 'user',
      };

      // when
      const neoTokens = new NeoTokens(attributes);

      // then
      expect(neoTokens).to.be.an.instanceof(NeoTokens);
      expect(neoTokens).to.deep.equal(attributes);
    });
  });
});
