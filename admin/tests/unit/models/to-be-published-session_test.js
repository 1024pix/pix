import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | to be published session', function (hooks) {
  setupTest(hooks);

  module('#printableDateAndTime', function () {
    test('it should return a printable version of to be published session date and time', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const toBePublishedSession = store.createRecord('to-be-published-session', {
        sessionDate: '2020-02-01',
        sessionTime: '14:30',
      });

      // when
      const printableDateAndTime = toBePublishedSession.printableDateAndTime;

      // then
      assert.strictEqual(printableDateAndTime, '01/02/2020 à 14:30');
    });
  });

  module('#printableFinalizationDate', function () {
    test('it should return a printable version of to be published session finalization date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const toBePublishedSession = store.createRecord('to-be-published-session', {
        finalizedAt: new Date('2020-02-01T15:30:01Z'),
      });

      // when
      const printableFinalizationDate = toBePublishedSession.printableFinalizationDate;

      // then
      assert.strictEqual(printableFinalizationDate, '01/02/2020');
    });
  });
});
