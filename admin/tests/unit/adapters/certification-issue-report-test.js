import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | certification-issue-report', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-issue-report');
    sinon.stub(adapter, 'ajax');
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#urlForUpdateRecord', function () {
    test('should build update certification issue report url from certification issue report id', function (assert) {
      // when
      const url = adapter.urlForUpdateRecord(1001);

      // then
      assert.ok(url.endsWith('/api/certification-issue-reports/1001'));
    });
  });

  module('#updateRecord', function () {
    module('when resolutionLabel adapter option passed', function () {
      test('it should trigger an ajax call to update the certification issue report', async function (assert) {
        // given
        sinon.stub(adapter, 'urlForUpdateRecord').returns('https://example.net/api/certification-issue-reports/123');
        const store = Symbol();

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'someModelName' },
          {
            id: 123,
            adapterOptions: { resolutionLabel: 'Toto' },
          },
        );

        // then
        const expectedPayload = {
          data: {
            resolution: 'Toto',
          },
        };
        assert.ok(
          adapter.ajax.calledWith('https://example.net/api/certification-issue-reports/123', 'PATCH', {
            data: expectedPayload,
          }),
        );
      });
    });
  });
});
