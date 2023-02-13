import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';
import { A as EmberArray } from '@ember/array';

module('Unit | Component | common/tubes-selection', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:common/tubes-selection', {
      frameworks: [
        { name: 'Pix', id: 'id1' },
        { name: 'framework2', id: 'id2' },
      ],
      onChange: sinon.stub(),
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

  module('#fillTubesSelectionFromFile', function (hooks) {
    const files = ['tubeId1', 'tubeId2', 'tubeId3'];

    hooks.beforeEach(function () {
      sinon.restore();
      sinon.stub(FileReader.prototype, 'readAsText');
    });

    test('should read the file', async function (assert) {
      component.fillTubesSelectionFromFile(files);

      assert.ok(FileReader.prototype.readAsText.calledWith(files[0]));
    });
  });

  module('#_onFileLoad', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when json file is valid', function () {
      test('it should fill skillIds list', async function (assert) {
        // given
        component.selectedFrameworkIds = [];
        component.selectedTubeIds = ['oldTube1'];
        component.tubeLevels = { oldTube1: 8 };
        component.isFileInvalid = true;
        const event = {
          target: {
            result: ['tubeId1', 'tubeId2', 'tubeId3'],
          },
        };
        const selectionTubeList = ['tubeId1', 'tubeId2', 'tubeId3'];
        sinon.stub(JSON, 'parse').returns(selectionTubeList);

        // when
        await component._onFileLoad(event);

        // then
        assert.deepEqual(component.selectedTubeIds, ['tubeId1', 'tubeId2', 'tubeId3']);
        assert.deepEqual(component.tubeLevels, {});
        assert.deepEqual(component.selectedFrameworkIds, ['id1']);
      });
    });
  });

  module('#_getSelectedTubesWithLevel', function () {
    test('it should return selected tubes with level', async function (assert) {
      // given
      const tubes1 = [{ id: 'tubeId1' }, { id: 'tubeId2' }];

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

      component.selectedTubeIds = EmberArray(['tubeId2', 'tubeId3']);

      component.tubeLevels = {
        tubeId2: 2,
      };

      // when
      const result = component._getSelectedTubesWithLevel();

      // then
      assert.deepEqual(result, [
        {
          id: 'tubeId2',
          level: 2,
        },
        {
          id: 'tubeId3',
          level: 8,
        },
      ]);
    });
  });
});
