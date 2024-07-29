import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | complementary-certifications/target-profiles/information', function (hooks) {
  setupTest(hooks);

  module('#isMultipleCurrentTargetProfiles', function () {
    module('when there is multiple current target profiles', function () {
      test('it should return true', async function (assert) {
        // given
        const component = createGlimmerComponent('component:complementary-certifications/target-profiles/information');

        component.args = {
          complementaryCertification: {
            currentTargetProfiles: [
              { id: 1, name: 'current target' },
              { id: 2, name: 'another current target' },
            ],
          },
        };

        // when & then
        assert.true(component.isMultipleCurrentTargetProfiles);
      });
    });

    module('when there is only one current target profiles', function () {
      test('it should return false', async function (assert) {
        // given
        const component = createGlimmerComponent('component:complementary-certifications/target-profiles/information');

        component.args = {
          complementaryCertification: {
            currentTargetProfiles: [{ id: 1, name: 'current target' }],
          },
        };

        // when & then
        assert.false(component.isMultipleCurrentTargetProfiles);
      });
    });

    module('when there is no current target profiles', function () {
      test('it should return false', async function (assert) {
        // given
        const component = createGlimmerComponent('component:complementary-certifications/target-profiles/information');

        component.args = {
          complementaryCertification: {
            currentTargetProfiles: [],
          },
        };

        // when & then
        assert.false(component.isMultipleCurrentTargetProfiles);
      });
    });
  });
});
