import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | fill-in-campaign-code', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    test('should store externalUser queryParam in session', function (assert) {
      // given
      const externalUser = 'external-user-token';
      const route = this.owner.lookup('route:fill-in-campaign-code');

      const sessionStub = Service.create({
        data: { externalUser: null },
      });
      route.set('session', sessionStub);

      const transition = { to: { queryParams: { externalUser } } };

      // when
      route.beforeModel(transition);

      // then
      assert.strictEqual(sessionStub.data.externalUser, externalUser);
    });
  });
});
