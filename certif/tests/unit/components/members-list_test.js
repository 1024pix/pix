import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | member-list', (hooks) => {
  setupTest(hooks);

  module('#orderedMemberListWithRefererFirst', () => {
    test('should return an array of members ordered by lastName and with referer first', async function (assert) {
      // given
      const component = createGlimmerComponent('component:members-list');
      component.args.members = [
        { firstName: 'Piegrièche', lastName: 'Ouicestunoiseau', isReferer: false },
        { firstName: 'Pierre', lastName: 'Quiroule', isReferer: true },
        { firstName: 'Paul', lastName: 'Ochon', isReferer: false },
      ];

      // when
      const result = component.orderedMemberListWithRefererFirst;

      // then
      assert.deepEqual(result, [
        { firstName: 'Pierre', lastName: 'Quiroule', isReferer: true },
        { firstName: 'Paul', lastName: 'Ochon', isReferer: false },
        { firstName: 'Piegrièche', lastName: 'Ouicestunoiseau', isReferer: false },
      ]);
    });
  });
});
