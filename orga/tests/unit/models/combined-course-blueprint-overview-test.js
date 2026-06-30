import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | combined-course-blueprint-overview', function (hooks) {
  setupTest(hooks);

  module('steps', function () {
    test('it should return the step', function (assert) {
      const store = this.owner.lookup('service:store');

      const item1 = store.createRecord('combined-course-blueprint-item', { name: 'Diagnostic', type: 'evaluation' });
      const item2 = store.createRecord('combined-course-blueprint-item', { name: 'Deepfakes', type: 'module' });
      const item3 = store.createRecord('combined-course-blueprint-item', { name: 'Ia générative', type: 'module' });
      const item4 = store.createRecord('combined-course-blueprint-item', { name: 'Evaluation', type: 'evaluation' });

      const model = store.createRecord('combined-course-blueprint-overview', {
        name: 'blueprint',
        description: 'description du contenu',
        illustration: 'image.svg',
        items: [item1, item2, item3, item4],
      });

      const steps = model.get('steps');

      assert.deepEqual(steps, [
        {
          type: 'evaluation',
          items: [item1],
        },
        {
          type: 'module',
          items: [item2, item3],
        },
        {
          type: 'evaluation',
          items: [item4],
        },
      ]);
    });
  });
});
