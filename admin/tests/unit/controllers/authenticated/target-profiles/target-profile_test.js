import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/target-profile', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/target-profiles/target-profile');
  });

  module('#get targetProfileContent', function () {
    test('should build target profile content for download', async function (assert) {
      const store = this.owner.lookup('service:store');
      controller.model = store.createRecord('target-profile', {
        tubesSelection: [
          { id: 'tubeId1', level: 5 },
          { id: 'tubeId2', level: 8 },
          { id: 'tubeId3', level: 7 },
        ],
        skills: [
          store.createRecord('skill', { id: 'skillId1', tubeId: 'tubeId1' }),
          store.createRecord('skill', { id: 'skillId2', tubeId: 'tubeId1' }),
          store.createRecord('skill', { id: 'skillId3', tubeId: 'tubeId2' }),
        ],
      });

      const result = controller.targetProfileContent;

      assert.deepEqual(result, [
        { id: 'tubeId1', level: 5, skills: ['skillId1', 'skillId2'] },
        { id: 'tubeId2', level: 8, skills: ['skillId3'] },
        { id: 'tubeId3', level: 7, skills: [] },
      ]);
    });
  });
});
