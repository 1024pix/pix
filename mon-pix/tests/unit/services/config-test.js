import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | config', function (hooks) {
  setupTest(hooks);

  module('load', function () {
    test('fetches config from API', async function (assert) {
      // given
      sinon.stub(window, 'fetch').resolves({
        ok: true,
        // headers: {
        //   get: sinon.stub().returns(`attachment; filename=${responseFileName}`),
        // },
        json: sinon.stub().resolves({}),
      });

      const configService = this.owner.lookup('service:config');

      // when
      const config = await configService.load();

      // then
      assert.deepEqual(config.featureToggles, {});
      assert.strictEqual(config.permitPixAdminLoginFromPassword, false);
    });
  });
});
