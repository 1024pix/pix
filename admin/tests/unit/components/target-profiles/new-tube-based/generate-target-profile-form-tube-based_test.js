import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createComponent from '../../../../helpers/create-glimmer-component';
import sinon from 'sinon';
import { A as EmberArray } from '@ember/array';

module('Unit | Component | target-profiles/new-tube-based/generate-target-profile-form-tube-based', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:target-profiles/new-tube-based/generate-target-profile-form-tube-based', {
      frameworks: [
        { name: 'Pix', id: 'id1' },
        { name: 'framework2', id: 'id2' },
      ],
    });
  });

  module('#frameworkOptions', function () {
    test('it should return a framework list as multiselect option data', function (assert) {
      // when
      const result = component.frameworkOptions;

      // then
      assert.deepEqual(result, [
        { label: 'Pix', value: 'id1' },
        { label: 'framework2', value: 'id2' },
      ]);
    });
  });

  module('#selectedFrameworks', function () {
    test('it should select Pix framework by default', function (assert) {
      // when
      const result = component.selectedFrameworks;

      // then
      assert.deepEqual(result, [{ name: 'Pix', id: 'id1' }]);
    });
  });

  module('#goBackToTargetProfileList', function () {
    test('should delete record and go back to target profile list page', async function (assert) {
      // given
      component.router.transitionTo = sinon.stub();

      // when
      component.goBackToTargetProfileList();

      // then
      assert.ok(component.router.transitionTo.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#checkTube', function () {
    test('it should add tube to the selected tubes', function (assert) {
      // given
      component.selectedTubeIds = EmberArray(['otherTubeId']);

      // when
      component.checkTube({
        id: 'tubeId',
      });

      // then
      assert.deepEqual(component.selectedTubeIds, ['otherTubeId', 'tubeId']);
    });

    module('when tube is already in the selected tubes', function () {
      test('it should do nothing', function (assert) {
        // given
        component.selectedTubeIds = ['tubeId'];

        // when
        component.checkTube({
          id: 'tubeId',
        });

        // then
        assert.deepEqual(component.selectedTubeIds, ['tubeId']);
      });
    });
  });

  module('#uncheckTube', function () {
    test('it should remove tube from selectedTubeIds if element is not checked', function (assert) {
      // given
      component.selectedTubeIds = EmberArray(['tubeId', 'otherTubeId']);

      // when
      component.uncheckTube({
        id: 'tubeId',
      });

      // then
      assert.deepEqual(component.selectedTubeIds, ['otherTubeId']);
    });

    module('when tube is not in the selected tubes', function () {
      test('it should do nothing', function (assert) {
        // given
        component.selectedTubeIds = EmberArray(['otherTubeId']);

        // when
        component.uncheckTube({
          id: 'tubeId',
        });

        // then
        assert.deepEqual(component.selectedTubeIds, ['otherTubeId']);
      });
    });
  });

  module('#setLevelTube', function () {
    test('it should set a level on tube', function (assert) {
      // given
      component.tubeLevels = {
        tubeId2: 3,
      };

      // when
      component.setLevelTube('tubeId1', 5);

      // then
      assert.deepEqual(component.tubeLevels, {
        tubeId1: 5,
        tubeId2: 3,
      });
    });
  });

  module('#hasNoFrameworksSelected', function () {
    module('when some frameworks are selected', function () {
      test('it should return false', function (assert) {
        // given
        component.selectedFrameworkIds = ['fmk1', 'fmk2'];

        // then
        assert.false(component.hasNoFrameworksSelected);
      });
    });

    module('when no frameworks are selected', function () {
      test('it should return true', function (assert) {
        // given
        component.selectedFrameworkIds = [];

        // then
        assert.true(component.hasNoFrameworksSelected);
      });
    });
  });

  module('#selectedTubes', function () {
    test('it should return selected tubes', function (assert) {
      // given
      const tubes1 = [
        {
          id: 'tubeId1',
          practicalTitle: 'Tube 1',
          practicalDescription: 'Description 1',
        },
        {
          id: 'tubeId2',
          practicalTitle: 'Tube 2',
          practicalDescription: 'Description 2',
        },
      ];

      const tubes2 = [
        {
          id: 'tubeId3',
          practicalTitle: 'Tube 3',
          practicalDescription: 'Description 3',
        },
        {
          id: 'tubeId4',
          practicalTitle: 'Tube 4',
          practicalDescription: 'Description 4',
        },
      ];

      const thematics = [
        { id: 'thematicId1', tubes: tubes1 },
        { id: 'thematicId2', tubes: tubes2 },
      ];

      const competences = [
        {
          id: 'competenceId',
          thematics,
        },
      ];

      component.areas = [
        {
          id: 'areaId',
          competences,
        },
      ];

      component.selectedTubeIds = EmberArray(['tubeId1', 'tubeId4']);

      // when
      const result = component.selectedTubes;

      // then
      assert.deepEqual(result, [
        {
          id: 'tubeId1',
          practicalTitle: 'Tube 1',
          practicalDescription: 'Description 1',
        },
        {
          id: 'tubeId4',
          practicalTitle: 'Tube 4',
          practicalDescription: 'Description 4',
        },
      ]);
    });
  });

  module('#getSelectedTubesWithLevelAndSkills', function () {
    test('it should return selected tubes', async function (assert) {
      // given
      const skills1 = Promise.resolve([
        { id: 'skillId1', level: 1 },
        { id: 'skillId2', level: 2 },
        { id: 'skillId3', level: 3 },
      ]);

      const skills2 = Promise.resolve([
        { id: 'skillId4', level: 1 },
        { id: 'skillId5', level: 3 },
        { id: 'skillId6', level: 7 },
      ]);

      const tubes1 = [
        { id: 'tubeId1' },
        {
          id: 'tubeId2',
          skills: skills1,
        },
      ];

      const tubes2 = [
        {
          id: 'tubeId3',
          practicalTitle: 'Tube 3',
          practicalDescription: 'Description 3',
          skills: skills2,
        },
        {
          id: 'tubeId4',
          practicalTitle: 'Tube 4',
          practicalDescription: 'Description 4',
        },
      ];

      const thematics = [
        { id: 'thematicId1', tubes: tubes1 },
        { id: 'thematicId2', tubes: tubes2 },
      ];

      const competences = [
        {
          id: 'competenceId',
          thematics,
        },
      ];

      component.areas = [
        {
          id: 'areaId',
          competences,
        },
      ];

      component.selectedTubeIds = EmberArray(['tubeId2', 'tubeId3']);

      component.tubeLevels = {
        tubeId2: 2,
      };

      // when
      const result = await component.getSelectedTubesWithLevelAndSkills();

      // then
      assert.deepEqual(result, [
        {
          id: 'tubeId2',
          level: 2,
          skills: ['skillId1', 'skillId2'],
        },
        {
          id: 'tubeId3',
          level: 8,
          skills: ['skillId4', 'skillId5', 'skillId6'],
        },
      ]);
    });
  });
});
