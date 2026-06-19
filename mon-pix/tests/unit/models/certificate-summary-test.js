import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { CERTIFICATE_STATUSES } from 'mon-pix/models/certificate-summary';
import { module, test } from 'qunit';

module('Unit | Model | certificate-summary', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#isCancelled', function () {
    test('it should return true when status is CANCELLED', function (assert) {
      // given
      const model = store.createRecord('certificate-summary', { status: CERTIFICATE_STATUSES.CANCELLED });

      // then
      assert.true(model.isCancelled);
    });

    test('it should return true when status is CANCELLED_BY_JURY', function (assert) {
      // given
      const model = store.createRecord('certificate-summary', { status: CERTIFICATE_STATUSES.CANCELLED_BY_JURY });

      // then
      assert.true(model.isCancelled);
    });

    [CERTIFICATE_STATUSES.VALIDATED, CERTIFICATE_STATUSES.REJECTED, CERTIFICATE_STATUSES.WAITING_FOR_RESULTS].forEach(
      (status) => {
        test(`it should return false when status is ${status}`, function (assert) {
          // given
          const model = store.createRecord('certificate-summary', { status });

          // then
          assert.false(model.isCancelled);
        });
      },
    );
  });
});
