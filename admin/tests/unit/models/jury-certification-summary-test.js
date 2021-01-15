import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { certificationStatuses } from 'pix-admin/models/certification';

module('Unit | Model | jury-certification-summary', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#statusLabel', function() {

    certificationStatuses.forEach(function({ value, label }) {
      module(`when the status is ${value}`, function() {

        test(`statusLabel should return ${label}`, function(assert) {
          // given
          const juryCertificationSummaryProcessed = run(() => {
            return store.createRecord('jury-certification-summary', { status: value });
          });

          // when
          const statusLabel = juryCertificationSummaryProcessed.get('statusLabel');

          // then
          assert.equal(statusLabel, label);
        });
      });
    });

  });

});
