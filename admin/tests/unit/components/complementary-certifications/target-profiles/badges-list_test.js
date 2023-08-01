import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | complementary-certifications/target-profiles/badges-list', function (hooks) {
  setupTest(hooks);

  test('it should display current target profile badges', async function (assert) {
    // given
    const component = createGlimmerComponent('component:complementary-certifications/target-profiles/badges-list');

    component.args = {
      currentTargetProfiles: [
        { id: 1, name: 'current target', badges: [{ id: 1, level: 2, label: 'badge Pluie' }] },
        { id: 2, name: 'old target', badges: [] },
      ],
    };

    // when & then
    assert.deepEqual(component.currentTargetProfileBadges, [{ id: 1, level: 2, label: 'badge Pluie' }]);
  });
});
