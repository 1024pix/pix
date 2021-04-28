import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | update-stage', function(hooks) {
  setupTest(hooks);

  module('#updateStage', function() {
    test('it should update controller stage fields', async function(assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', { model: {
        prescriberTitle: '',
        prescriberDescription: '',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.prescriberTitle = 'palier intermédiaire';
      component.form.prescriberDescription = 'le niveau est moyen';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateStage(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(component.args.model.save.called);
      assert.equal(component.args.model.prescriberTitle, 'palier intermédiaire');
      assert.equal(component.args.model.prescriberDescription, 'le niveau est moyen');
    });

    test('it should update stage field even if a field is empty', async function(assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', { model: {
        prescriberTitle: 'palier intermédiaire',
        prescriberDescription: '',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.prescriberDescription = 'Ceci est une description';
      component.form.prescriberTitle = '';

      // when
      await component.updateStage(event);

      // then
      assert.ok(component.args.model.save.called);
      assert.equal(component.args.model.prescriberDescription, 'Ceci est une description');
      assert.equal(component.args.model.prescriberTitle, null);
    });

    test('it should display a success notification when model has been saved', async function(assert) {
      // given
      const component = createGlimmerComponent('component:stages/update-stage', { model: {
        prescriberTitle: '',
        prescriberDescription: '',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });

      const event = {
        preventDefault: sinon.stub(),
      };
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
