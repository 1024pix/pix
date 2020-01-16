import { skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

skip('Unit | Component | authenticated/sessions/details/certification-candidates-tab', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const component = this.owner.lookup('component:routes/authenticated/sessions/details/certification-candidates-tab');
    assert.ok(component);
  });
});
