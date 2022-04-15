import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Controller | authenticated/target-profiles/new-tube-based/tubes-selection', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:target-profiles/new-tube-based/tubes-selection');
  });

  module('#checkTube', function () {
    test('it should populate tubesSelected if element is checked with a selected level', function (assert) {
      // given

      const tubeId = 'tubeId';
      const tube = {
        id: tubeId,
        name: 'tubeName',
      };
      const expectedTubesSelected = [{ id: 'tubeId', level: 'Illimité' }];

      // when
      component.checkTube(tube);

      // then

      assert.deepEqual(component.tubesSelected, expectedTubesSelected);
    });
  });

  module('#uncheckTube', function () {
    test('it should remove tube from tubesSelected if element is not checked', function (assert) {
      // given
      component.tubesSelected = [{ id: 'tubeId', level: 'illimité' }];

      const tube = {
        id: 'tubeId',
        name: 'tubeName',
      };

      // when
      component.uncheckTube(tube);

      // then

      assert.deepEqual(component.tubesSelected, []);
    });
  });

  module('#setLevelTube', function () {
    test('it should set a level on tube', function (assert) {
      // given
      component.tubesSelected = [
        { id: 'tubeId1', level: 'Illimité' },
        { id: 'tubeId2', level: '3' },
      ];

      // when
      component.setLevelTube('tubeId1', '5');

      // then

      assert.deepEqual(component.tubesSelected, [
        { id: 'tubeId1', level: '5' },
        { id: 'tubeId2', level: '3' },
      ]);
    });
  });
});
