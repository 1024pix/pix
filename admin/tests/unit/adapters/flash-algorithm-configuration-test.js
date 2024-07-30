import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | flash-algorithm-configuration', function (hooks) {
  setupTest(hooks);

  module('#queryRecord', () => {
    test('should build query url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:flash-algorithm-configuration');
      sinon.stub(adapter, 'ajax');

      // when
      adapter.queryRecord();

      // then
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/flash-assessment-configuration`;
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'GET');
      assert.ok(adapter);
    });
  });

  module('#createRecord', () => {
    test('should call the post url with the correct payload', async function (assert) {
      // given
      const flashAlgorithmConfiguration = { warmUpLength: 2 };
      const payload = { data: flashAlgorithmConfiguration };
      const adapter = this.owner.lookup('adapter:flash-algorithm-configuration');
      sinon.stub(adapter, 'ajax');

      // when
      adapter.createRecord(flashAlgorithmConfiguration);

      // then
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/flash-assessment-configuration`;
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', payload);
      assert.ok(adapter);
    });
  });
});
