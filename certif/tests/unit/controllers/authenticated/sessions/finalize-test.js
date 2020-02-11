import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

const FINALIZE_PATH = 'authenticated/sessions/finalize';

module('Unit | Controller | ' + FINALIZE_PATH, function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
    assert.ok(controller);
  });

  test('it should count no unchecked box if no report', function(assert) {

    // given
    const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
    const sessions = ArrayProxy.create({
      certificationReports: []
    });
    controller.set('model', sessions);

    // when
    const uncheckedHasSeenEndTestScreenCount = controller.get('uncheckedHasSeenEndTestScreenCount');

    // then
    assert.equal(uncheckedHasSeenEndTestScreenCount, 0);
  });

  test('it should count unchecked boxes', function(assert) {

    // given
    const controller = this.owner.lookup('controller:' + FINALIZE_PATH);
    const sessions = ArrayProxy.create({
      certificationReports: [
        { hasSeenEndTestScreen: true },
        { hasSeenEndTestScreen: false },
        { hasSeenEndTestScreen: false },
        { hasSeenEndTestScreen: false },
        { hasSeenEndTestScreen: true },
      ]
    });
    controller.set('model', sessions);

    // when
    const uncheckedHasSeenEndTestScreenCount = controller.get('uncheckedHasSeenEndTestScreenCount');

    // then
    assert.equal(uncheckedHasSeenEndTestScreenCount, 3);
  });
});
