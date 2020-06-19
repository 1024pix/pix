import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';

module('Unit | Adapters | student', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:student');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function(assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/students'));
      assert.equal(query.organizationId, undefined);
    });
  });

  module('#dissociateUser', function() {
    let ajaxStub;

    hooks.beforeEach(function() {
      ajaxStub = sinon.stub();
      adapter.set('ajax', ajaxStub);
    });

    test('it performs the request to dissociate user from student', async function(assert) {
      const model = { id: 12345 };
      const data = {
        data: {
          attributes: {
            'schooling-registration-id': model.id,
          }
        }
      };
      const url = `${ENV.APP.API_HOST}/api/schooling-registration-user-associations`;

      await adapter.dissociateUser(model);

      assert.ok(ajaxStub.calledWith(url, 'DELETE', { data }));
    });
  });
});
