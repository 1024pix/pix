import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | certificationCenterMembership', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-center-membership');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQuery', function () {
    test('should build query url from certificationCenter id', async function (assert) {
      const query = { filter: { certificationCenterId: '1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/admin/certification-centers/1/certification-center-memberships'));
      assert.strictEqual(query.filter.certificationCenterId, undefined);
    });
  });

  module('#createRecord', function () {
    module('when createByEmail is true', function () {
      test('should call /api/admin/certification-centers/id/certification-center-memberships', async function (assert) {
        // given
        const certificationCenterId = 1;
        const email = 'user@example.net';

        const snapshot = {
          adapterOptions: {
            createByEmail: true,
            certificationCenterId,
            email,
          },
        };
        const expectedUrl = `http://localhost:3000/api/admin/certification-centers/${certificationCenterId}/certification-center-memberships`;
        const expectedMethod = 'POST';
        const expectedPayload = { data: { email } };

        // when
        await adapter.createRecord(null, null, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedPayload);
        assert.ok(true);
      });
    });
  });
});
