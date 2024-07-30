import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

const FRANCE_TLD = 'fr';
const INTERNATIONAL_TLD = 'org';

module('Unit | Service | currentDomain', function (hooks) {
  setupTest(hooks);

  module('#isFranceDomain', function () {
    test('returns true when TLD is the France domain (.fr)', function (assert) {
      // given
      const service = this.owner.lookup('service:currentDomain');
      service.getExtension = sinon.stub().returns(FRANCE_TLD);

      // when
      const isFranceDomain = service.isFranceDomain;

      // then
      assert.true(isFranceDomain);
    });

    test('returns false when TLD is the international domain (.org)', function (assert) {
      // given
      const service = this.owner.lookup('service:currentDomain');
      service.getExtension = sinon.stub().returns(INTERNATIONAL_TLD);

      // when
      const isFranceDomain = service.isFranceDomain;

      // then
      assert.false(isFranceDomain);
    });
  });

  module('#getJuniorBaseUrl', function () {
    test('should return url with junior instead of orga for review app', function (assert) {
      const service = this.owner.lookup('service:currentDomain');
      const url = new URL('https://orga-pr8887.review.pix.fr');
      const result = service.getJuniorBaseUrl(url);
      assert.deepEqual(result, 'https://junior-pr8887.review.pix.fr');
    });
  });
});
