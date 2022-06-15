import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { A as EmberArray } from '@ember/array';

module('Unit | Controller | authenticated/target-profiles/new', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/target-profiles/new');
  });

  module('#goBackToTargetProfileList', function () {
    test('should delete record and go back target profile list page', async function (assert) {
      controller.store.deleteRecord = sinon.stub();
      controller.router.transitionTo = sinon.stub();
      controller.model = { targetProfile: Symbol('targetProfile') };

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model.targetProfile));
      assert.ok(controller.router.transitionTo.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#createTargetProfile', function (hooks) {
    hooks.beforeEach(function () {
      const skills1 = Promise.resolve([
        { id: 'skillId1', level: 1 },
        { id: 'skillId2', level: 2 },
        { id: 'skillId3', level: 3 },
      ]);

      const skills2 = Promise.resolve([
        { id: 'skillId4', level: 1 },
        { id: 'skillId5', level: 3 },
        { id: 'skillId6', level: 7 },
      ]);

      const tubes1 = [
        { id: 'tubeId1' },
        {
          id: 'tubeId2',
          skills: skills1,
        },
      ];

      const tubes2 = [
        {
          id: 'tubeId3',
          practicalTitle: 'Tube 3',
          practicalDescription: 'Description 3',
          skills: skills2,
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

      controller.areas = [
        {
          id: 'areaId',
          competences,
        },
      ];

      controller.selectedTubeIds = EmberArray(['tubeId2', 'tubeId3']);

      controller.tubeLevels = {
        tubeId2: 2,
      };
    });

    test('it should save model', async function (assert) {
      controller.model = {
        targetProfile: {
          id: 3,
          save: sinon.stub().resolves(),
        },
      };

      controller.router.transitionTo = sinon.stub();

      controller.notifications = {
        success: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.targetProfile.save.called);
      assert.ok(controller.notifications.success.calledWith('Le profil cible a été créé avec succès.'));
      assert.ok(
        controller.router.transitionTo.calledWith(
          'authenticated.target-profiles.target-profile',
          controller.model.targetProfile.id
        )
      );
    });

    test('it should display error notification when model cannot be saved', async function (assert) {
      controller.notifications = {
        error: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      controller.model = {
        targetProfile: {
          save: sinon.stub().rejects(),
        },
      };

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.targetProfile.save.called);
      assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });

    test('it should display detailed error notification when model cannot be saved', async function (assert) {
      controller.model = {
        targetProfile: {
          save: sinon.stub().rejects({
            errors: [{ status: '404', detail: 'Organisation non trouvée' }],
          }),
        },
      };

      controller.notifications = {
        error: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.targetProfile.save.called);
      assert.ok(controller.notifications.error.calledWith('Organisation non trouvée'));
    });
  });

  module('#getSelectedTubesWithLevelAndSkills', function () {
    test('it should return selected tubes', async function (assert) {
      // given
      const skills1 = Promise.resolve([
        { id: 'skillId1', level: 1 },
        { id: 'skillId2', level: 2 },
        { id: 'skillId3', level: 3 },
      ]);

      const skills2 = Promise.resolve([
        { id: 'skillId4', level: 1 },
        { id: 'skillId5', level: 3 },
        { id: 'skillId6', level: 7 },
      ]);

      const tubes1 = [
        { id: 'tubeId1' },
        {
          id: 'tubeId2',
          skills: skills1,
        },
      ];

      const tubes2 = [
        {
          id: 'tubeId3',
          practicalTitle: 'Tube 3',
          practicalDescription: 'Description 3',
          skills: skills2,
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

      controller.areas = [
        {
          id: 'areaId',
          competences,
        },
      ];

      controller.selectedTubeIds = EmberArray(['tubeId2', 'tubeId3']);

      controller.tubeLevels = {
        tubeId2: 2,
      };

      // when
      const result = await controller.getSelectedTubesWithLevelAndSkills();

      // then
      assert.deepEqual(result, [
        {
          id: 'tubeId2',
          level: 2,
          skills: ['skillId1', 'skillId2'],
        },
        {
          id: 'tubeId3',
          level: 8,
          skills: ['skillId4', 'skillId5', 'skillId6'],
        },
      ]);
    });
  });
});
