import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | user-account/language', function (hooks) {
  setupTest(hooks);

  module('#onChangeLang', function () {
    test('should refresh page on change lang if domain is not french', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account/language');
      controller.url = { isFrenchDomainExtension: false };
      const replaceStub = sinon.stub();
      controller.location = { replace: replaceStub };

      // when
      controller.onChangeLang('en');

      // then
      sinon.assert.calledWith(replaceStub, '/mon-compte/langue?lang=en');
      assert.ok(true);
    });
  });
});
