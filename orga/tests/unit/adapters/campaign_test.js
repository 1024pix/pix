import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';

module('Unit | Adapter | campaign', function(hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;
  const model = { id: 1 };
  const url = `${ENV.APP.API_HOST}/api/campaigns/${model.id}/archive`;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:campaign');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('archive', function() {
    test('it should send a PUT request with a proper url', async function(assert) {
      // when
      await adapter.archive(model);

      assert.ok(ajaxStub.calledWith(url, 'PUT'));
    });
  });

  module('unarchive', function() {
    test('it should send a DELETE request with a proper url', async function(assert) {
      // when
      await adapter.unarchive(model);

      assert.ok(ajaxStub.calledWith(url, 'DELETE'));
    });
  });

});
