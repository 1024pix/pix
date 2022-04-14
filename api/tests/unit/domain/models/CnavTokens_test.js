const { expect } = require('../../../test-helper');
const CnavTokens = require('../../../../lib/domain/models/CnavTokens');

describe('Unit | Domain | Models | CnavTokens', function () {
  describe('#constructor', function () {
    it('should construct a model CnavTokens from attributes', function () {
      // given
      const attributes = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 60,
        refreshToken: 'refreshToken',
      };

      // when
      const cnavTokens = new CnavTokens(attributes);

      // then
      expect(cnavTokens).to.be.an.instanceof(CnavTokens);
      expect(cnavTokens).to.deep.equal(attributes);
    });
  });
});
