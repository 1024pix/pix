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

  module('#query', () => {
    test('should request the sco participants endpoint and strip organizationId from the query filter', async function (assert) {
      // given
      const query = { filter: { organizationId: 'organizationId1', divisions: ['3A'] }, page: { number: 2 } };

      // when
      await adapter.query(null, { modelName: 'sco-organization-participant' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.ok(url.endsWith('/api/organizations/organizationId1/sco-participants'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { filter: { divisions: ['3A'] }, page: { number: 2 } } });
      assert.deepEqual(query, {
        filter: { organizationId: 'organizationId1', divisions: ['3A'] },
        page: { number: 2 },
      });
    });
  });

  module('#generateOrganizationLearnersUsernamePassword', function (hooks) {
    hooks.afterEach(() => {
      window.fetch.restore();
    });

    test('generates organization learners username with password and saves a CSV file', async function (assert) {
      // given
      const fetch = sinon.stub(window, 'fetch').returns();
      const fileSaver = { save: sinon.stub().resolves() };
      const organizationId = 1;
      const organizationLearnersIds = [23, 789];
      const token = 'best token ever';
      adapter.host = 'pix.local';
      adapter.namespace = 'api';

      // when
      await adapter.generateOrganizationLearnersUsernamePassword({
        fileSaver,
        organizationId,
        organizationLearnersIds,
        token,
      });

      // then
      const expectedUrl = `${adapter.host}/${adapter.namespace}/sco-organization-learners/batch-username-password-generate`;

      const reqHeaders = new Headers();

      reqHeaders.set('Authorization', `Bearer ${token}`);
      reqHeaders.set('Content-Type', 'application/json');

      const expectedOptions = {
        method: 'POST',
        headers: reqHeaders,
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

  module('#unblockOrganizationLearner', function () {
    test('calls ajax with correct URL and PUT method', async function (assert) {
      // given
      const organizationId = 1;
      const organizationLearnerId = 11;
      adapter.host = 'pix.local';
      adapter.namespace = 'api';

      const expectedUrl = `${adapter.host}/${adapter.namespace}/organizations/${organizationId}/sco-organization-learners/${organizationLearnerId}/unblock`;

      // when
      await adapter.unblockOrganizationLearner({
        organizationId,
        organizationLearnerId,
      });

      // then
      sinon.assert.calledWith(ajaxStub, expectedUrl, 'PUT');
      assert.ok(true);
    });
  });
});
