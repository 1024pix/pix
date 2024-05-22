import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module(
  'Unit | Component | certifications | complementary-certifications | target-profiles | attach-target-profile',
  function (hooks) {
    setupTest(hooks);

    module('#onChange', function () {
      test('it should reset the selectedTargetProfile', async function (assert) {
        // given
        const component = createGlimmerComponent('component:complementary-certifications/attach-badges');

        // when
        component.onReset();

        // then
        assert.strictEqual(component.selectedTargetProfile, undefined);
        assert.true(component.isSubmitDisabled);
        assert.false(component.isSubmitting);
      });
    });
  },
);
