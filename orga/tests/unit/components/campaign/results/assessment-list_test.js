import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | AssessmentList', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:campaign/results/assessment-list');
  });

  module('get displayParticipationCount', () => {
    test('should return true when campaign has multiple sending enabled', function (assert) {
      //when
      component.args.campaign = { multipleSendings: true };

      // then
      assert.true(component.displayParticipationCount);
    });

    test('should return false when campaign has multiple sending not enabled', function (assert) {
      //when
      component.args.campaign = { multipleSendings: false };

      // then
      assert.false(component.displayParticipationCount);
    });
  });
});
