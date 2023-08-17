import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | sco-organization-participant', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:sco-organization-participant');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function (assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/sco-participants'));
      assert.strictEqual(query.organizationId, undefined);
    });
  });

  module('#resetOrganizationLearnersPassword', function () {
    test('resets organization learners password and saves a CSV file', async function (assert) {
      // given
      const fetch = sinon.stub().resolves();
      const fileSaver = { save: sinon.stub().resolves() };
      const organizationId = 1;
      const organizationLearnersIds = [23, 789];
      const token = 'best token ever';
      adapter.host = 'pix.local';
      adapter.namespace = 'api';

      // when
      await adapter.resetOrganizationLearnersPassword({
        fetch,
        fileSaver,
        organizationId,
        organizationLearnersIds,
        token,
      });

      // then
      const expectedUrl = `${adapter.host}/${adapter.namespace}/sco-organization-learners/password-reset`;
      const expectedOptions = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            data: {
              attributes: { 'organization-id': organizationId, 'organization-learners-id': organizationLearnersIds },
            },
          },
          null,
          2,
        ),
      };
      sinon.assert.calledWith(fetch, expectedUrl, expectedOptions);
      sinon.assert.calledOnce(fileSaver.save);
      assert.ok(true);
    });
  });
});
