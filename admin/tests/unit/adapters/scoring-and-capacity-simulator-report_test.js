import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | scoring-and-capacity-simulator-report', function (hooks) {
  setupTest(hooks);

  module('#getSimulatorResult', function () {
    module('when a score is given', function () {
      test('should trigger POST request with the correct payload and URL', async function (assert) {
        // given
        const adapter = this.owner.lookup('adapter:scoring-and-capacity-simulator-report');
        sinon.stub(adapter, 'ajax');

        const adapterOptions = {
          score: 1,
          capacity: null,
        };

        // when
        await adapter.getSimulatorResult(adapterOptions);

        // then
        const expectedUrl = 'http://localhost:3000/api/admin/simulate-score-or-capacity';
        const expectedPayload = {
          data: {
            data: {
              score: 1,
            },
          },
        };
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });

    module('when a capacity is given', function () {
      test('should trigger POST request with the correct payload and URL', async function (assert) {
        // given
        const adapter = this.owner.lookup('adapter:scoring-and-capacity-simulator-report');
        sinon.stub(adapter, 'ajax');

        const adapterOptions = {
          capacity: 1,
          score: null,
        };

        // when
        await adapter.getSimulatorResult(adapterOptions);

        // then
        const expectedUrl = 'http://localhost:3000/api/admin/simulate-score-or-capacity';
        const expectedPayload = {
          data: {
            data: {
              capacity: 1,
            },
          },
        };
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
