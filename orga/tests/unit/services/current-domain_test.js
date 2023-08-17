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
});
