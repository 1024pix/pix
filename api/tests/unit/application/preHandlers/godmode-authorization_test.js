const { expect, sinon, hFake } = require('../../../test-helper');
const godmodeAuthorization = require('../../../../lib/application/preHandlers/godmode-authorization');
const { featureToggles } = require('../../../../lib/config');

describe('Unit | Pre-handler | Godmode Authorization', () => {

  describe('#verify', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(featureToggles, 'godmode');
    });

    it('should return ok when godmode access feature is enabled', () => {
      // given
      featureToggles.godmode = true;

      // when
      const result = godmodeAuthorization.verify(request, hFake);

      // then
      expect(result).to.equal('ok');
    });

    it('should take over the request and response with 401 status code', () => {
      // given
      featureToggles.godmode = false;

      // when
      const result = godmodeAuthorization.verify(request, hFake);

      // then
      expect(result.statusCode).to.equal(401);
      expect(result.isTakeOver).to.be.true;
    });
  });
});
