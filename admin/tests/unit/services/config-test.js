import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | config', function (hooks) {
  setupTest(hooks);

  module('load', function () {
    test('fetches config from API', async function (assert) {
      // given
      const requestManager = this.owner.lookup('service:request-manager');
      sinon
        .stub(requestManager, 'request')
        .resolves({ content: { featureToggles: {}, permitPixAdminLoginFromPassword: true } });

      const configService = this.owner.lookup('service:config');

      // when
      await configService.load();

      // then
      assert.deepEqual(configService.featureToggles, {});
      assert.true(configService.permitPixAdminLoginFromPassword);
    });
  });
});
