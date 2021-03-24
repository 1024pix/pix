import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { ACQUIRED, REJECTED, NOT_PASSED } from 'pix-admin/models/certification';

module('Unit | Model | certification', (hooks) => {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  test('it exists', function(assert) {
    const model = run(() => store.createRecord('certification', {}));
    assert.ok(model);
  });

  module('#isCleaCertificationIsAcquired', () => {

    const cleaStatusesAndExpectedResult = new Map([
      [ACQUIRED, true],
      [REJECTED, false],
      [NOT_PASSED, false],
    ]);
    cleaStatusesAndExpectedResult.forEach((expectedResult, cleaStatus) => {
      module(`when cleaCertificationStatus is ${cleaStatus}`, () => {

        test(`isCleaCertificationIsAcquired should be ${expectedResult}`, function(assert) {
          // given
          const certification = run(() => store.createRecord('certification', {
            cleaCertificationStatus: cleaStatus,
          }));

          // when
          const result = certification.isCleaCertificationIsAcquired;

          // then
          assert.equal(result, expectedResult);
        });
      });
    });
  });

  module('#isCleaCertificationIsRejected', () => {

    const cleaStatusesAndExpectedResult = new Map([
      [ACQUIRED, false],
      [REJECTED, true],
      [NOT_PASSED, false],
    ]);
    cleaStatusesAndExpectedResult.forEach((expectedResult, cleaStatus) => {
      module(`when cleaCertificationStatus is ${cleaStatus}`, () => {

        test(`isCleaCertificationIsRejected should be ${expectedResult}`, function(assert) {
          // given
          const certification = run(() => store.createRecord('certification', {
            cleaCertificationStatus: cleaStatus,
          }));

          // when
          const result = certification.isCleaCertificationIsRejected;

          // then
          assert.equal(result, expectedResult);
        });
      });
    });
  });

});
