import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | publishable session', function(hooks) {
  setupTest(hooks);

  module('#printableDateAndTime', function() {
    test('it should return a printable version of publishable session date and time', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const publishableSession = store.createRecord('publishable-session', {
        sessionDate: '2020-02-01',
        sessionTime: '14:30',
      });

      // when
      const printableDateAndTime = publishableSession.printableDateAndTime;

      // then
      assert.equal(printableDateAndTime, '01/02/2020 à 14:30');
    });
  });

  module('#printableFinalizationDate', function() {
    test('it should return a printable version of publishable session finalization date', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const publishableSession = store.createRecord('publishable-session', {
        finalizedAt: new Date('2020-02-01T15:30:01Z'),
      });

      // when
      const printableFinalizationDate = publishableSession.printableFinalizationDate;

      // then
      assert.equal(printableFinalizationDate, '01/02/2020');
    });
  });
});
