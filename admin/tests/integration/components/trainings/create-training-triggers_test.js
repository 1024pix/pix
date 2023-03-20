import { module, test } from 'qunit';
import { render, clickByText } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings::CreateTrainingTriggers', function (hooks) {
  setupIntlRenderingTest(hooks);

  module("If a goal trigger exists and a prerequisite trigger doesn't exist", function (nestedHook) {
    nestedHook.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const tube1Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube1Thematic1Competence1Area1ID',
        name: 'tube1Thematic1Competence1Area1 name',
        practicalTitle: 'tube1Thematic1Competence1Area1 practicalTitle',
      });
      const tube2Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube2Thematic1Competence1Area1ID',
        name: 'tube2Thematic1Competence1Area1 name',
        practicalTitle: 'tube2Thematic1Competence1Area1 practicalTitle',
      });
      const tube3Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube3Thematic1Competence1Area1ID',
        name: 'tube3Thematic1Competence1Area1 name',
        practicalTitle: 'tube3Thematic1Competence1Area1 practicalTitle',
      });
      const tube4Thematic2Competence1Area1 = store.createRecord('tube', {
        id: 'tube4Thematic2Competence1Area1ID',
        name: 'tube4Thematic2Competence1Area1 name',
        practicalTitle: 'tube4Thematic2Competence1Area1 practicalTitle',
      });
      const trainingTriggerTube1 = store.createRecord('trigger-tube', {
        id: 1,
        tube: tube1Thematic1Competence1Area1,
        level: 3,
      });
      const trainingTriggerTube2 = store.createRecord('trigger-tube', {
        id: 2,
        tube: tube2Thematic1Competence1Area1,
        level: 1,
      });
      const trainingTriggerTube3 = store.createRecord('trigger-tube', {
        id: 3,
        tube: tube3Thematic1Competence1Area1,
        level: 5,
      });
      const trainingTriggerTube4 = store.createRecord('trigger-tube', {
        id: 4,
        tube: tube4Thematic2Competence1Area1,
        level: 8,
      });
      const thematic1Competence1Area1 = store.createRecord('thematic', {
        id: 'thematic1Competence1Area1ID',
        name: 'thematic1Competence1Area1 name',
        index: 'thematic1Competence1Area1 index',
        triggerTubes: [trainingTriggerTube1, trainingTriggerTube2, trainingTriggerTube3],
      });
      const thematic2Competence1Area1 = store.createRecord('thematic', {
        id: 'thematic2Competence1Area1ID',
        name: 'thematic2Competence1Area1 name',
        index: 'thematic2Competence1Area1 index',
        triggerTubes: [trainingTriggerTube4],
      });
      const competence1Area1 = store.createRecord('competence', {
        id: 'competence1Area1ID',
        name: 'competence1Area1 name',
        index: 'competence1Area1 index',
        thematics: [thematic1Competence1Area1, thematic2Competence1Area1],
      });
      const thematic1Competence2Area1 = store.createRecord('thematic', {
        id: 'thematic1Competence2Area1ID',
        name: 'thematic1Competence2Area1 name',
        index: 'thematic1Competence2Area1 index',
        triggerTubes: [trainingTriggerTube3],
      });
      const competence2Area1 = store.createRecord('competence', {
        id: 'competence2Area1ID',
        name: 'competence2Area1 name',
        index: 'competence2Area1 index',
        thematics: [thematic1Competence2Area1],
      });
      const area1 = store.createRecord('area', {
        id: 'area1ID',
        title: 'area1 title',
        code: 'area1 code',
        color: 'area1 color',
        frameworkId: 'frameworkId1',
        competences: [competence1Area1, competence2Area1],
      });
      const tube1Thematic1Competence1Area2 = store.createRecord('tube', {
        id: 'tube1Thematic1Competence1Area2ID',
        name: 'tube1Thematic1Competence1Area2 name',
        practicalTitle: 'tube1Thematic1Competence1Area2 practicalTitle',
      });
      const trainingTriggerTubeForArea2 = store.createRecord('trigger-tube', {
        id: 5,
        tube: tube1Thematic1Competence1Area2,
        level: 3,
      });
      const thematic1Competence1Area2 = store.createRecord('thematic', {
        id: 'thematic1Competence1Area2ID',
        name: 'thematic1Competence1Area2 name',
        index: 'thematic1Competence1Area2 index',
        triggerTubes: [trainingTriggerTubeForArea2],
      });
      const competence1Area2 = store.createRecord('competence', {
        id: 'competence1Area2ID',
        name: 'competence1Area2 name',
        index: 'competence1Area2 index',
        thematics: [thematic1Competence1Area2],
      });
      const area2 = store.createRecord('area', {
        id: 'area2ID',
        title: 'area2 title',
        code: 'area2 code',
        color: 'area2 color',
        frameworkId: 'frameworkId2',
        competences: [competence1Area2],
      });

      const trainingTrigger = store.createRecord('training-trigger', {
        type: 'goal',
        areas: [area1, area2],
        threshold: 19,
      });
      this.set('training', {
        goalTrigger: trainingTrigger,
      });
    });

    test('it should display the prerequisite creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.prerequisite.alternative-title')))
        .exists();
    });

    test('it should not display the goal creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.goal.alternative-title')))
        .doesNotExist();
      assert.dom(screen.getByText('Seuil : 19%')).exists();
      assert.dom(screen.getByText('area1 code · area1 title')).exists();
      await clickByText('area1 code · area1 title');
      assert.dom(screen.getByText('competence1Area1 index competence1Area1 name')).exists();
      await clickByText('competence1Area1 index competence1Area1 name');
      assert.dom(screen.getByText('thematic1Competence1Area1 name')).exists();
      assert
        .dom(screen.getByText('tube1Thematic1Competence1Area1 name : tube1Thematic1Competence1Area1 practicalTitle'))
        .exists();
      assert
        .dom(screen.getByText('tube2Thematic1Competence1Area1 name : tube2Thematic1Competence1Area1 practicalTitle'))
        .exists();
      assert
        .dom(screen.getByText('tube3Thematic1Competence1Area1 name : tube3Thematic1Competence1Area1 practicalTitle'))
        .exists();
    });
  });

  module("If a prerequisite trigger exists and a goal trigger doesn't exist", function (nestedHook) {
    nestedHook.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const tube1Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube1Thematic1Competence1Area1ID',
        name: 'tube1Thematic1Competence1Area1 name',
        practicalTitle: 'tube1Thematic1Competence1Area1 practicalTitle',
      });
      const tube2Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube2Thematic1Competence1Area1ID',
        name: 'tube2Thematic1Competence1Area1 name',
        practicalTitle: 'tube2Thematic1Competence1Area1 practicalTitle',
      });
      const tube3Thematic1Competence1Area1 = store.createRecord('tube', {
        id: 'tube3Thematic1Competence1Area1ID',
        name: 'tube3Thematic1Competence1Area1 name',
        practicalTitle: 'tube3Thematic1Competence1Area1 practicalTitle',
      });
      const tube4Thematic2Competence1Area1 = store.createRecord('tube', {
        id: 'tube4Thematic2Competence1Area1ID',
        name: 'tube4Thematic2Competence1Area1 name',
        practicalTitle: 'tube4Thematic2Competence1Area1 practicalTitle',
      });
      const trainingTriggerTube1 = store.createRecord('trigger-tube', {
        id: 1,
        tube: tube1Thematic1Competence1Area1,
        level: 3,
      });
      const trainingTriggerTube2 = store.createRecord('trigger-tube', {
        id: 2,
        tube: tube2Thematic1Competence1Area1,
        level: 1,
      });
      const trainingTriggerTube3 = store.createRecord('trigger-tube', {
        id: 3,
        tube: tube3Thematic1Competence1Area1,
        level: 5,
      });
      const trainingTriggerTube4 = store.createRecord('trigger-tube', {
        id: 4,
        tube: tube4Thematic2Competence1Area1,
        level: 8,
      });
      const thematic1Competence1Area1 = store.createRecord('thematic', {
        id: 'thematic1Competence1Area1ID',
        name: 'thematic1Competence1Area1 name',
        index: 'thematic1Competence1Area1 index',
        triggerTubes: [trainingTriggerTube1, trainingTriggerTube2, trainingTriggerTube3],
      });
      const thematic2Competence1Area1 = store.createRecord('thematic', {
        id: 'thematic2Competence1Area1ID',
        name: 'thematic2Competence1Area1 name',
        index: 'thematic2Competence1Area1 index',
        triggerTubes: [trainingTriggerTube4],
      });
      const competence1Area1 = store.createRecord('competence', {
        id: 'competence1Area1ID',
        name: 'competence1Area1 name',
        index: 'competence1Area1 index',
        thematics: [thematic1Competence1Area1, thematic2Competence1Area1],
      });
      const thematic1Competence2Area1 = store.createRecord('thematic', {
        id: 'thematic1Competence2Area1ID',
        name: 'thematic1Competence2Area1 name',
        index: 'thematic1Competence2Area1 index',
        triggerTubes: [trainingTriggerTube3],
      });
      const competence2Area1 = store.createRecord('competence', {
        id: 'competence2Area1ID',
        name: 'competence2Area1 name',
        index: 'competence2Area1 index',
        thematics: [thematic1Competence2Area1],
      });
      const area1 = store.createRecord('area', {
        id: 'area1ID',
        title: 'area1 title',
        code: 'area1 code',
        color: 'area1 color',
        frameworkId: 'frameworkId1',
        competences: [competence1Area1, competence2Area1],
      });
      const tube1Thematic1Competence1Area2 = store.createRecord('tube', {
        id: 'tube1Thematic1Competence1Area2ID',
        name: 'tube1Thematic1Competence1Area2 name',
        practicalTitle: 'tube1Thematic1Competence1Area2 practicalTitle',
      });
      const trainingTriggerTubeForArea2 = store.createRecord('trigger-tube', {
        id: 5,
        tube: tube1Thematic1Competence1Area2,
        level: 3,
      });

      const thematic1Competence1Area2 = store.createRecord('thematic', {
        id: 'thematic1Competence1Area2ID',
        name: 'thematic1Competence1Area2 name',
        index: 'thematic1Competence1Area2 index',
        triggerTubes: [trainingTriggerTubeForArea2],
      });
      const competence1Area2 = store.createRecord('competence', {
        id: 'competence1Area2ID',
        name: 'competence1Area2 name',
        index: 'competence1Area2 index',
        thematics: [thematic1Competence1Area2],
      });
      const area2 = store.createRecord('area', {
        id: 'area2ID',
        title: 'area2 title',
        code: 'area2 code',
        color: 'area2 color',
        frameworkId: 'frameworkId2',
        competences: [competence1Area2],
      });

      const trainingTrigger = store.createRecord('training-trigger', {
        type: 'prerequisite',
        areas: [area1, area2],
        threshold: 20,
      });
      this.set('training', {
        prerequisiteTrigger: trainingTrigger,
      });
    });

    test('it should not display the prerequisite creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.prerequisite.alternative-title')))
        .doesNotExist();
      assert.dom(screen.getByText('Seuil : 20%')).exists();
      assert.dom(screen.getByText('area1 code · area1 title')).exists();
      await clickByText('area1 code · area1 title');
      assert.dom(screen.getByText('competence1Area1 index competence1Area1 name')).exists();
      await clickByText('competence1Area1 index competence1Area1 name');
      assert.dom(screen.getByText('thematic1Competence1Area1 name')).exists();
      assert
        .dom(screen.getByText('tube1Thematic1Competence1Area1 name : tube1Thematic1Competence1Area1 practicalTitle'))
        .exists();
      assert
        .dom(screen.getByText('tube2Thematic1Competence1Area1 name : tube2Thematic1Competence1Area1 practicalTitle'))
        .exists();
      assert
        .dom(screen.getByText('tube3Thematic1Competence1Area1 name : tube3Thematic1Competence1Area1 practicalTitle'))
        .exists();

      assert.dom(screen.getByText('area2 code · area2 title')).exists();
      await clickByText('area2 code · area2 title');
      assert.dom(screen.getByText('competence1Area2 index competence1Area2 name')).exists();
      await clickByText('competence1Area2 index competence1Area2 name');
      assert.dom(screen.getByText('thematic1Competence1Area2 name')).exists();
      assert
        .dom(screen.getByText('tube1Thematic1Competence1Area2 name : tube1Thematic1Competence1Area2 practicalTitle'))
        .exists();
    });

    test('it should display the goal creation link', async function (assert) {
      // when
      const screen = await render(hbs`<Trainings::CreateTrainingTriggers @training={{this.training}} />`);

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.trainings.training.triggers.goal.alternative-title')))
        .exists();
    });
  });
});
