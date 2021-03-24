import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit |  Component | Target Profiles | stages', (hooks) => {
  setupTest(hooks);

  module('#displayNoThresholdZero', () => {
    test('returns false if there a stage with a threshold value at 0', function(assert) {
      const component = createComponent('component:target-profiles/stages');
      component.args = {
        stages: [
          { threshold: 0 },
        ],
      };

      assert.notOk(component.displayNoThresholdZero);
    });

    test('returns true if there is no stage with a threshold value at 0', function(assert) {
      const component = createComponent('component:target-profiles/stages');
      component.args = {
        stages: [
          { threshold: 45 },
        ],
      };

      assert.ok(component.displayNoThresholdZero);
    });

    test('returns false if there is no stage', function(assert) {
      const component = createComponent('component:target-profiles/stages');
      component.args = {
        stages: [],
      };

      assert.notOk(component.displayNoThresholdZero);
    });
  });
});
