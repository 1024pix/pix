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
        model: {
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
      component.form.threshold = 42;
      component.form.title = 'titre modifié';
      component.form.message = 'message modifié';
      component.form.prescriberTitle = 'palier intermédiaire';
      component.form.prescriberDescription = 'le niveau est moyen';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateStage(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(component.args.model.save.called);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.threshold, 42);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.title, 'titre modifié');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.message, 'message modifié');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.prescriberTitle, 'palier intermédiaire');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.prescriberDescription, 'le niveau est moyen');
    });

    test('it should update stage field even if a field is empty', async function (assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', {
        model: {
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
      component.form.message = '';
      component.form.prescriberDescription = 'Ceci est une description';
      component.form.prescriberTitle = '';

      // when
      await component.updateStage(event);

      // then
      assert.ok(component.args.model.save.called);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.threshold, 50);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.title, 'titre du palier');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.message, null);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.prescriberDescription, 'Ceci est une description');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.model.prescriberTitle, null);
    });

    test('it should display a success notification when model has been saved', async function (assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', {
        model: {
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
      component.form.threshold = 50;
      component.form.title = '';
      component.form.message = '';
      component.form.prescriberTitle = 'palier intermédiaire';
      component.form.prescriberDescription = 'le niveau est moyen';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateStage(event);

      // then
      assert.ok(component.notifications.success.called);
    });
  });
});
