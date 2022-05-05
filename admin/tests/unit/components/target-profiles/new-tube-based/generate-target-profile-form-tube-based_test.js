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
      component.tubesSelected = EmberArray(['otherTubeId']);

      // when
      component.checkTube({
        id: 'tubeId',
      });

      // then
      assert.deepEqual(component.tubesSelected, ['otherTubeId', 'tubeId']);
    });

    module('when tube is already in the selected tubes', function () {
      test('it should do nothing', function (assert) {
        // given
        component.tubesSelected = ['tubeId'];

        // when
        component.checkTube({
          id: 'tubeId',
        });

        // then
        assert.deepEqual(component.tubesSelected, ['tubeId']);
      });
    });
  });

  module('#uncheckTube', function () {
    test('it should remove tube from tubesSelected if element is not checked', function (assert) {
      // given
      component.tubesSelected = EmberArray(['tubeId', 'otherTubeId']);

      // when
      component.uncheckTube({
        id: 'tubeId',
      });

      // then
      assert.deepEqual(component.tubesSelected, ['otherTubeId']);
    });

    module('when tube is not in the selected tubes', function () {
      test('it should do nothing', function (assert) {
        // given
        component.tubesSelected = EmberArray(['otherTubeId']);

        // when
        component.uncheckTube({
          id: 'tubeId',
        });

        // then
        assert.deepEqual(component.tubesSelected, ['otherTubeId']);
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
});
