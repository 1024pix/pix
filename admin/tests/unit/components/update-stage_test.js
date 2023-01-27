import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | update-stage', function (hooks) {
  setupTest(hooks);

  module('#updateStage', function () {
    test('it should update controller stage fields', async function (assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', {
        stage: {
          threshold: 50,
          title: 'titre originel',
          message: 'message originel',
          prescriberTitle: '',
          prescriberDescription: '',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.threshold = 42;
      component.title = 'titre modifié';
      component.message = 'message modifié';
      component.prescriberTitle = 'palier intermédiaire';
      component.prescriberDescription = 'le niveau est moyen';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateStage(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(component.args.stage.save.called);
      assert.strictEqual(component.args.stage.threshold, 42);
      assert.strictEqual(component.args.stage.title, 'titre modifié');
      assert.strictEqual(component.args.stage.message, 'message modifié');
      assert.strictEqual(component.args.stage.prescriberTitle, 'palier intermédiaire');
      assert.strictEqual(component.args.stage.prescriberDescription, 'le niveau est moyen');
    });

    test('it should update stage field even if a field is empty', async function (assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', {
        stage: {
          threshold: 50,
          title: 'titre du palier',
          message: '',
          prescriberTitle: 'palier intermédiaire',
          prescriberDescription: '',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.threshold = 50;
      component.title = 'titre du palier';
      component.message = '';
      component.prescriberDescription = 'Ceci est une description';
      component.prescriberTitle = '';

      // when
      await component.updateStage(event);

      // then
      assert.ok(component.args.stage.save.called);
      assert.strictEqual(component.args.stage.threshold, 50);
      assert.strictEqual(component.args.stage.title, 'titre du palier');
      assert.strictEqual(component.args.stage.message, null);
      assert.strictEqual(component.args.stage.prescriberDescription, 'Ceci est une description');
      assert.strictEqual(component.args.stage.prescriberTitle, null);
    });

    test('it should display a success notification when model has been saved', async function (assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', {
        stage: {
          threshold: 50,
          title: '',
          message: '',
          prescriberTitle: '',
          prescriberDescription: '',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.threshold = 50;
      component.title = '';
      component.message = '';
      component.prescriberTitle = 'palier intermédiaire';
      component.prescriberDescription = 'le niveau est moyen';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateStage(event);

      // then
      assert.ok(component.notifications.success.called);
    });
  });
});
