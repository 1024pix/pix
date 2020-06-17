import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';

module('Unit | Adapters | organization', function(hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:organization');
    ajaxStub = sinon.stub();
    adapter.ajax = ajaxStub;
  });

  module('#findHasMany', function() {
    test('should build url with query params when type is membership', async function(assert) {
      // given
      const snapshot = { modelName: 'organization', id: '1', adapterOptions: { 'page[size]': 2 } };
      const relationship = { type: 'membership' };
      const url = '/api/organizations/1/memberships';
      const expectedUrl = `${ENV.APP.API_HOST}/api/organizations/1/memberships?page%5Bsize%5D=2`;

      // when
      await adapter.findHasMany({}, snapshot, url, relationship);

      // then
      assert.ok(ajaxStub.calledWith(expectedUrl, 'GET'));
    });

    test('should build url without query params when type is not membership', async function(assert) {
      // given
      const snapshot = { modelName: 'organization', id: '1', adapterOptions: { 'page[size]': 2 } };
      const relationship = { type: 'target-profile' };
      const url = '/api/organizations/1/target-profiles';
      const expectedUrl = `${ENV.APP.API_HOST}/api/organizations/1/target-profiles`;

      // when
      await adapter.findHasMany({}, snapshot, url, relationship);

      // then
      assert.ok(ajaxStub.calledWith(expectedUrl, 'GET'));
    });
  });
});
