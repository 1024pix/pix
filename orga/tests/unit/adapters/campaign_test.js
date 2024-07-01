import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | campaign', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;
  const model = { id: 1 };
  const url = `${ENV.APP.API_HOST}/api/campaigns/${model.id}/archive`;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#delete', () => {
    test('should call campaigns deletion endpoint', async function (assert) {
      // given
      const organizationId = 1;
      const campaign1Id = 2;
      const campaign2Id = 3;

      // when
      adapter.delete(organizationId, [campaign1Id, campaign2Id]);

      // then
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/campaigns`;
      const expectedData = {
        data: [
          { id: campaign1Id, type: 'campaign' },
          { id: campaign2Id, type: 'campaign' },
        ],
      };
      assert.ok(ajaxStub.calledWithExactly(url, 'DELETE', { data: expectedData }));
    });
  });

  module('archive', function () {
    test('it should send a PUT request with a proper url', async function (assert) {
      // when
      await adapter.archive(model);

      assert.ok(ajaxStub.calledWith(url, 'PUT'));
    });
  });

  module('unarchive', function () {
    test('it should send a DELETE request with a proper url', async function (assert) {
      // when
      await adapter.unarchive(model);

      assert.ok(ajaxStub.calledWith(url, 'DELETE'));
    });
  });
});
