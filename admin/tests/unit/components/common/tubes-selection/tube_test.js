import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | common/tubes-selection/tube', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:common/tubes-selection/tube');
  });
  module('#setLevelTube', function () {
    test('it should set a level on tube', function (assert) {
      // given
      const checkTubeStub = sinon.stub();
      const setLevelTubeStub = sinon.stub();

      component.args.tube = { id: 'tubeId1' };
      component.args.checkTube = checkTubeStub;
      component.args.setLevelTube = setLevelTubeStub;

      // when
      component.setLevelTube('5');

      // then
      assert.ok(checkTubeStub.calledWith(component.args.tube));
      assert.ok(setLevelTubeStub.calledWith('tubeId1', '5'));
    });
  });
});
