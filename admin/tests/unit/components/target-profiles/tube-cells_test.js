import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Controller | authenticated/target-profiles/tube-cells', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:target-profiles/tube-cells');
  });
  module('#setLevelTube', function () {
    test('it should set a level on tube', function (assert) {
      // given
      const event = {
        currentTarget: {
          value: '5',
        },
      };
      const setLevelTubeStub = sinon.stub();
      component.args.tube = { id: 'tubeId1' };
      component.args.setLevelTube = setLevelTubeStub;

      // when
      component.setLevelTube(event);

      // then
      assert.ok(setLevelTubeStub.calledWith('tubeId1', '5'));
    });
  });
});
