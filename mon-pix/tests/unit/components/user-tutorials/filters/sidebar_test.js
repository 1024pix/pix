import { module, test } from 'qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | User-Tutorials | Filters | Sidebar', function (hooks) {
  setupTest(hooks);

  module('#handleFilterChange', function () {
    module('when element is not in array', function () {
      test('should add id on corresponding type array', function (assert) {
        // given
        const type = 'competences';
        const id = 'competenceId1';
        const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');

        // when
        component.handleFilterChange(type, id);

        // then
        assert.true(component.filters[type].includes(id));
      });
    });

    module('when element is already in list', function () {
      test('should remove it', function (assert) {
        // given
        const type = 'competences';
        const id = 'competenceId1';
        const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');
        component.filters[type].pushObject(id);

        // when
        component.handleFilterChange(type, id);

        // then
        assert.false(component.filters[type].includes(id));
      });
    });
  });

  module('#handleResetFilters', function () {
    test('should reset all filters', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');
      component.filters.competences = ['competence1', 'competence2'];

      // when
      component.handleResetFilters();

      // then
      assert.ok(component.filters.competences);
      assert.strictEqual(component.filters.competences.length, 0);
    });
  });
});
