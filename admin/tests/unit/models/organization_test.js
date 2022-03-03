import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  test('it formats the archived date', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('organization', { archivedAt: new Date('2022-02-22') }));

    // when
    const archivedFormattedDate = model.archivedFormattedDate;

    // then
    assert.strictEqual(archivedFormattedDate, '22/02/2022');
  });
});
