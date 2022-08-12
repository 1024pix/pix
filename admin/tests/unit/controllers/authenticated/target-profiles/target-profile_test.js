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
        tubes: [
          store.createRecord('tube', { id: 'tubeId1', competenceId: 'compId1' }),
          store.createRecord('tube', { id: 'tubeId2', competenceId: 'compId1' }),
          store.createRecord('tube', { id: 'tubeId3', competenceId: 'compId2' }),
        ],
        competences: [
          store.createRecord('competence', { id: 'compId1', areaId: 'areaId1' }),
          store.createRecord('competence', { id: 'compId2', areaId: 'areaId2' }),
        ],
        areas: [
          store.createRecord('area', { id: 'areaId1', frameworkId: 'fmkId1' }),
          store.createRecord('area', { id: 'areaId2', frameworkId: 'fmkId2' }),
        ],
      });

      const result = controller.targetProfileContent;

      assert.deepEqual(result, [
        { id: 'tubeId1', level: 5, frameworkId: 'fmkId1', skills: ['skillId1', 'skillId2'] },
        { id: 'tubeId2', level: 8, frameworkId: 'fmkId1', skills: ['skillId3'] },
        { id: 'tubeId3', level: 7, frameworkId: 'fmkId2', skills: [] },
      ]);
    });
  });
});
