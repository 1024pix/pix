import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Controller | authenticated/target-profiles/list-tubes', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:target-profiles/list-tubes');
  });

  module('#updateSelectedTubes', function () {
    test('it should populate tubesSelected if element is checked with a selected level', function (assert) {
      // given
      component._toggleCheckboxThematicByTubes = sinon.stub();
      component._toggleCheckboxCompetenceByElement = sinon.stub();
      component._getSelectedTubeLevel = sinon.stub().returns('Illimité');

      const event = {
        currentTarget: {
          checked: true,
        },
      };
      const tubeId = 'tubeId';
      const expectedTubesSelected = [{ id: 'tubeId', level: 'Illimité' }];

      // when
      component.updateSelectedTubes(tubeId, event);

      // then

      assert.deepEqual(component.tubesSelected, expectedTubesSelected);
    });

    test('it should remove tube from tubesSelected if element is not checked', function (assert) {
      // given
      component._toggleCheckboxThematicByTubes = sinon.stub();
      component._toggleCheckboxCompetenceByElement = sinon.stub();
      component.tubesSelected = [{ id: 'tubeId', level: 'illimité' }];

      const event = {
        currentTarget: {
          checked: false,
        },
      };
      const tubeId = 'tubeId';

      // when
      component.updateSelectedTubes(tubeId, event);

      // then

      assert.deepEqual(component.tubesSelected, []);
    });
  });

  module('#updateSelectedThematic', function (hooks) {
    let thematicId;
    let querySelectorAllStub;
    let tube1;
    let tube2;

    hooks.beforeEach(function () {
      thematicId = 'thematicId';
      tube1 = { getAttribute: sinon.stub().returns('tubeId1'), checked: false };
      tube2 = { getAttribute: sinon.stub().returns('tubeId2'), checked: true };
      component._toggleCheckboxCompetenceByElement = sinon.stub();
      component._getSelectedTubeLevel = sinon.stub().returns('Illimité');
      querySelectorAllStub = sinon.stub(document, 'querySelectorAll').returns([tube1, tube2]);
    });

    hooks.afterEach(function () {
      querySelectorAllStub.restore();
    });

    test('it should populate tubesSelected with a selected level if thematic is checked', function (assert) {
      // given
      component.tubesSelected = [{ id: 'tubeId2', level: 'Illimité' }];
      const event = { currentTarget: { checked: true } };

      // when
      component.updateSelectedThematic(thematicId, event);

      // then
      assert.ok(querySelectorAllStub.calledWith(`[data-thematic="${thematicId}"]`));
      assert.ok(tube1.checked);
      assert.ok(tube2.checked);
      assert.deepEqual(component.tubesSelected, [
        { id: 'tubeId2', level: 'Illimité' },
        { id: 'tubeId1', level: 'Illimité' },
      ]);
    });

    test('it should remove tube from corresponding thematic if thematic is not checked', function (assert) {
      // given
      component.tubesSelected = [
        { id: 'tubeId2', level: 'Illimité' },
        { id: 'tubeId3', level: '3' },
      ];
      const event = { currentTarget: { checked: false } };

      // when
      component.updateSelectedThematic(thematicId, event);

      // then
      assert.ok(querySelectorAllStub.calledWith(`[data-thematic="${thematicId}"]`));
      assert.notOk(tube1.checked);
      assert.notOk(tube2.checked);
      assert.deepEqual(component.tubesSelected, [{ id: 'tubeId3', level: '3' }]);
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
