import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | complementary-certifications/target-profiles/information', function (hooks) {
  setupTest(hooks);

  test('it should display current target profile', async function (assert) {
    // given
    const component = createGlimmerComponent('component:complementary-certifications/target-profiles/information');

    component.args = {
      complementaryCertification: {
        targetProfilesHistory: [
          { id: 1, name: 'current target' },
          { id: 2, name: 'old target' },
        ],
      },
    };

    // when & then
    assert.deepEqual(component.currentTargetProfile, { id: 1, name: 'current target' });
  });
});
