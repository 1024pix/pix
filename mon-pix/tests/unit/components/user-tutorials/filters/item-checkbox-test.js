import { A } from '@ember/array';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | User-Tutorials | Filters | ItemCheckbox', function (hooks) {
  setupTest(hooks);

  test('should throw an error if component has no type param', async function (assert) {
    // given & when
    const componentParams = { item: { name: 'item' } };

    // then
    assert.throws(() => {
      createGlimmerComponent('user-tutorials/filters/item-checkbox', componentParams);
    }, 'ERROR in UserTutorials::Filters::ItemCheckbox component, you must provide @type params');
  });

  module('#isChecked', function () {
    module('when element is in currentFilters', function () {
      test('should return true', function (assert) {
        // given
        const componentParams = {
          type: 'competences',
          item: { id: 'competenceId1' },
          currentFilters: { competences: A(['competenceId1']) },
        };
        const component = createGlimmerComponent('user-tutorials/filters/item-checkbox', componentParams);

        // when
        const result = component.isChecked;

        // then
        assert.true(result);
      });
    });

    module('when element is not in currentFilters', function () {
      test('should return false', function (assert) {
        // given
        const componentParams = {
          type: 'competences',
          item: { id: 'competenceId1' },
          currentFilters: { competences: A([]) },
        };
        const component = createGlimmerComponent('user-tutorials/filters/item-checkbox', componentParams);

        // when
        const result = component.isChecked;

        // then
        assert.false(result);
      });
    });
  });
});
