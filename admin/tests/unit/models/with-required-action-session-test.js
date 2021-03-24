import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | with required action session', (hooks) => {
  setupTest(hooks);

  module('#printableDateAndTime', () => {
    test('it should return a printable version of session with required action date and time', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionWithRequiredAction = store.createRecord('with-required-action-session', {
        sessionDate: '2020-02-01',
        sessionTime: '14:30',
      });

      // when
      const printableDateAndTime = sessionWithRequiredAction.printableDateAndTime;

      // then
      assert.equal(printableDateAndTime, '01/02/2020 à 14:30');
    });
  });

  module('#printableFinalizationDate', () => {
    test('it should return a printable version of session with required action finalization date', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionWithRequiredAction = store.createRecord('with-required-action-session', {
        finalizedAt: new Date('2020-02-01T15:30:01Z'),
      });

      // when
      const printableFinalizationDate = sessionWithRequiredAction.printableFinalizationDate;

      // then
      assert.equal(printableFinalizationDate, '01/02/2020');
    });
  });
});
