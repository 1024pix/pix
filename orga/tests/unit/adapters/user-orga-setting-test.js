import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import sinon from 'sinon';

module('Unit | Adapters | user-orga-setting', (hooks) => {
  setupTest(hooks);

  let adapter;
  const userId = 1;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:user-orga-setting');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForUpdateRecord', () => {

    test('it should build update url from user id', async function(assert) {
      // when
      const snapshot = { adapterOptions: { userId } };
      const url = await adapter.urlForUpdateRecord(123, 'user-orga-setting', snapshot);

      // then
      assert.equal(url.endsWith(`/user-orga-settings/${userId}`), true);
    });
  });

  module('#updateRecord', () => {
    module('when userId adapterOption passed', (hooks) => {

      hooks.beforeEach(() => {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(() => {
        adapter.ajax.restore();
      });

      test('should send a put request to user-orga-settings endpoint', async function(assert) {
        // given
        adapter.ajax.resolves();
        const snapshot = {
          id: 1,
          adapterOptions: { userId },
          serialize: function() {},

        };

        // when
        await adapter.updateRecord(null, { modelName: 'user-orga-setting' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/user-orga-settings/${userId}`, 'PUT');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });

  module('#urlForCreateRecord', () => {

    test('it should build create url from user id', async function(assert) {
      // when
      const snapshot = { adapterOptions: { userId: 1 } };
      const url = await adapter.urlForCreateRecord('user-orga-setting', snapshot);

      // then
      assert.equal(url.endsWith('/user-orga-settings/1'), true);
    });
  });

  module('#createRecord', () => {
    module('when userId adapterOption passed', (hooks) => {

      hooks.beforeEach(() => {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(() => {
        adapter.ajax.restore();
      });

      test('should send a put request to /user-orga-settings to create', async function(assert) {
        // given
        adapter.ajax.resolves();
        const snapshot = {
          id: 1,
          adapterOptions: { userId },
          serialize: function() {},

        };

        // when
        await adapter.createRecord(null, { modelName: 'user-orga-setting' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/user-orga-settings/${userId}`, 'PUT');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
